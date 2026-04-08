import { SharedLink, ReportFilters } from '@/lib/types';
import { LocalStorageManager } from '@/lib/utils/localStorage';

export interface CreateSharedLinkParams {
  createdBy: string;
  companyIds: string[];
  origin: 'home' | 'reports';
  filters?: ReportFilters;
  expirationOption: '2h' | '1d' | '1w' | '1m' | 'custom';
  customExpirationDate?: Date;
}

export interface SharedLinkAnalytics {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  revokedLinks: number;
  totalAccesses: number;
  linksByOrigin: {
    home: number;
    reports: number;
  };
  recentAccesses: Array<{
    linkId: string;
    accessedAt: Date;
    origin: string;
  }>;
}

export class SharedLinksService {
  private static generateLinkId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private static calculateExpirationDate(
    option: CreateSharedLinkParams['expirationOption'],
    customDate?: Date
  ): Date {
    const now = new Date();
    
    switch (option) {
      case '2h':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
      case '1d':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '1w':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '1m':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'custom':
        return customDate || new Date(now.getTime() + 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  static async createSharedLink(params: CreateSharedLinkParams): Promise<SharedLink> {
    const linkId = this.generateLinkId();
    const expiresAt = this.calculateExpirationDate(
      params.expirationOption,
      params.customExpirationDate
    );

    const sharedLink: SharedLink = {
      id: linkId,
      createdBy: params.createdBy,
      companyIds: params.companyIds,
      origin: params.origin,
      filters: params.filters,
      createdAt: new Date(),
      expiresAt,
      status: 'active',
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${linkId}`,
      accessCount: 0,
    };

    // Store the shared link
    const existingLinks = LocalStorageManager.getSharedLinks() as SharedLink[];
    existingLinks.push(sharedLink);
    LocalStorageManager.setSharedLinks(existingLinks);

    return sharedLink;
  }

  static async getSharedLinks(companyId?: string): Promise<SharedLink[]> {
    const allLinks = LocalStorageManager.getSharedLinks() as SharedLink[];
    
    // Update expired links
    const now = new Date();
    const updatedLinks = allLinks.map(link => ({
      ...link,
      status: link.status === 'active' && link.expiresAt < now ? 'expired' as const : link.status
    }));

    // Save updated links
    LocalStorageManager.setSharedLinks(updatedLinks);

    // Filter by company if specified
    if (companyId) {
      return updatedLinks.filter(link => link.companyIds.includes(companyId));
    }

    return updatedLinks;
  }

  static async getSharedLink(linkId: string): Promise<SharedLink | null> {
    const allLinks = LocalStorageManager.getSharedLinks() as SharedLink[];
    const link = allLinks.find(l => l.id === linkId || l.url.endsWith(linkId));
    
    if (!link) return null;

    // Check if expired
    const now = new Date();
    if (link.status === 'active' && link.expiresAt < now) {
      await this.updateSharedLink(link.id, { status: 'expired' });
      return { ...link, status: 'expired' };
    }

    return link;
  }

  static async updateSharedLink(
    linkId: string, 
    updates: Partial<SharedLink>
  ): Promise<boolean> {
    return LocalStorageManager.updateSharedLink(linkId, updates);
  }

  static async revokeSharedLink(linkId: string): Promise<boolean> {
    return this.updateSharedLink(linkId, { status: 'revoked' });
  }

  static async deleteSharedLink(linkId: string): Promise<boolean> {
    const allLinks = LocalStorageManager.getSharedLinks() as SharedLink[];
    const filteredLinks = allLinks.filter(link => link.id !== linkId);
    return LocalStorageManager.setSharedLinks(filteredLinks);
  }

  static async incrementAccessCount(linkId: string): Promise<boolean> {
    const link = await this.getSharedLink(linkId);
    if (!link) return false;

    const newAccessCount = link.accessCount + 1;
    
    // Log the access for analytics
    this.logAccess(linkId, link.origin);
    
    return this.updateSharedLink(linkId, { accessCount: newAccessCount });
  }

  private static logAccess(linkId: string, origin: string): void {
    const accessLog = LocalStorageManager.get('shared_links_access_log', []) as Array<{
      linkId: string;
      accessedAt: Date;
      origin: string;
    }>;

    accessLog.push({
      linkId,
      accessedAt: new Date(),
      origin
    });

    // Keep only last 100 access logs
    if (accessLog.length > 100) {
      accessLog.splice(0, accessLog.length - 100);
    }

    LocalStorageManager.set('shared_links_access_log', accessLog);
    
    // Also track in persistence service for analytics
    try {
      import('../services/persistence').then(({ PersistenceService }) => {
        PersistenceService.trackSharedLinkAccess(linkId, origin);
      }).catch(() => {
        // Ignore if persistence service is not available
      });
    } catch (error) {
      // Ignore if persistence service is not available
    }
  }

  static async getAnalytics(companyId?: string): Promise<SharedLinkAnalytics> {
    const links = await this.getSharedLinks(companyId);
    const accessLog = LocalStorageManager.get('shared_links_access_log', []) as Array<{
      linkId: string;
      accessedAt: Date;
      origin: string;
    }>;

    const analytics: SharedLinkAnalytics = {
      totalLinks: links.length,
      activeLinks: links.filter(l => l.status === 'active').length,
      expiredLinks: links.filter(l => l.status === 'expired').length,
      revokedLinks: links.filter(l => l.status === 'revoked').length,
      totalAccesses: links.reduce((sum, link) => sum + link.accessCount, 0),
      linksByOrigin: {
        home: links.filter(l => l.origin === 'home').length,
        reports: links.filter(l => l.origin === 'reports').length,
      },
      recentAccesses: accessLog
        .filter(access => {
          if (companyId) {
            const link = links.find(l => l.id === access.linkId);
            return link && link.companyIds.includes(companyId);
          }
          return true;
        })
        .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime())
        .slice(0, 10)
    };

    return analytics;
  }

  static async validateSharedLink(token: string): Promise<{
    valid: boolean;
    link?: SharedLink;
    error?: string;
  }> {
    try {
      const link = await this.getSharedLink(token);
      
      if (!link) {
        return { valid: false, error: 'Enlace no encontrado' };
      }

      const now = new Date();
      
      if (link.expiresAt < now) {
        await this.updateSharedLink(link.id, { status: 'expired' });
        return { valid: false, error: 'Este enlace ha expirado' };
      }

      if (link.status === 'revoked') {
        return { valid: false, error: 'Este enlace ha sido revocado' };
      }

      if (link.status !== 'active') {
        return { valid: false, error: 'Este enlace no está disponible' };
      }

      return { valid: true, link };
    } catch (error) {
      return { valid: false, error: 'Error al validar el enlace' };
    }
  }

  static async cleanupExpiredLinks(): Promise<number> {
    const allLinks = LocalStorageManager.getSharedLinks() as SharedLink[];
    const now = new Date();
    
    const validLinks = allLinks.filter(link => {
      return link.expiresAt > now || link.status === 'revoked';
    });

    const removedCount = allLinks.length - validLinks.length;
    
    if (removedCount > 0) {
      LocalStorageManager.setSharedLinks(validLinks);
    }

    return removedCount;
  }

  static async getExpiringLinks(hoursThreshold: number = 24): Promise<SharedLink[]> {
    const links = await this.getSharedLinks();
    const now = new Date();
    const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);

    return links.filter(link => 
      link.status === 'active' && 
      link.expiresAt <= threshold && 
      link.expiresAt > now
    );
  }
}