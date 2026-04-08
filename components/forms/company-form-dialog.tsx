'use client';

import React, { useState, useEffect } from 'react';
import { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CompanyFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (companyData: Partial<Company>) => Promise<void>;
    company?: Company | null;
}

interface FormData {
    name: string;
    slug: string;
    contactEmail: string;
    contactPhone: string;
    status: Company['status'];
}

interface FormErrors {
    name?: string;
    slug?: string;
    contactEmail?: string;
    contactPhone?: string;
    status?: string;
}

export function CompanyFormDialog({ isOpen, onClose, onSubmit, company }: CompanyFormDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        slug: '',
        contactEmail: '',
        contactPhone: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when dialog opens/closes or company changes
    useEffect(() => {
        if (isOpen) {
            if (company) {
                setFormData({
                    name: company.name || '',
                    slug: company.slug || '',
                    contactEmail: company.contactEmail || '',
                    contactPhone: company.contactPhone || '',
                    status: company.status || 'active',
                });
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    contactEmail: '',
                    contactPhone: '',
                    status: 'active',
                });
            }
            setErrors({});
        }
    }, [isOpen, company]);

    // Auto-generate slug from company name
    useEffect(() => {
        if (!company && formData.name) {
            const generatedSlug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, company]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required fields
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre de la empresa es requerido';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'El slug es requerido';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
        }

        if (!formData.contactEmail.trim()) {
            newErrors.contactEmail = 'El email de contacto es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'El email no tiene un formato válido';
        }

        // Optional phone validation
        if (formData.contactPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.contactPhone)) {
            newErrors.contactPhone = 'El teléfono no tiene un formato válido';
        }

        // Status validation
        if (!formData.status) {
            newErrors.status = 'El estado es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = {
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                contactEmail: formData.contactEmail.trim().toLowerCase(),
                contactPhone: formData.contactPhone.trim() || undefined,
                status: formData.status,
            };

            // Check if onSubmit is actually a function
            if (typeof onSubmit === 'function') {
                await onSubmit(submitData);
            } else {
                // DEMO MODE: Create company directly in localStorage
                const newCompany = {
                    id: `company-${Date.now()}`,
                    name: submitData.name,
                    slug: submitData.slug,
                    contactEmail: submitData.contactEmail,
                    contactPhone: submitData.contactPhone,
                    status: submitData.status,
                    createdAt: new Date(),
                };

                // Get current mock data and add the new company
                const mockDataStr = localStorage.getItem('energeia_mock_data');
                if (mockDataStr) {
                    const mockData = JSON.parse(mockDataStr);
                    mockData.companies.push(newCompany);
                    localStorage.setItem('energeia_mock_data', JSON.stringify(mockData));
                }

                // Trigger a custom event to notify the parent component
                window.dispatchEvent(new CustomEvent('companyCreated', { detail: newCompany }));
            }

            // Limpiar y cerrar tras submit exitoso
            setFormData({
                name: '',
                slug: '',
                contactEmail: '',
                contactPhone: '',
                status: 'active',
            });
            setErrors({});
            onClose();
        } catch (error) {
            // Error handling is done in the parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {company ? 'Editar empresa' : 'Crear nueva empresa'}
                    </DialogTitle>
                    <DialogDescription>
                        {company
                            ? 'Modifica los datos de la empresa. Los campos marcados con * son obligatorios.'
                            : 'Completa los datos de la nueva empresa. Los campos marcados con * son obligatorios.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Nombre de la empresa *
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ej: Empresa Energética S.A."
                            disabled={isSubmitting}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">
                            Slug (identificador único) *
                        </Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => handleInputChange('slug', e.target.value)}
                            placeholder="empresa-energetica-sa"
                            disabled={isSubmitting}
                            className={errors.slug ? 'border-red-500' : ''}
                        />
                        {errors.slug && (
                            <p className="text-sm text-red-600">{errors.slug}</p>
                        )}
                        <p className="text-sm text-slate-500">
                            Solo letras minúsculas, números y guiones. Se genera automáticamente desde el nombre.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">
                            Email de contacto *
                        </Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                            placeholder="contacto@empresa.com"
                            disabled={isSubmitting}
                            className={errors.contactEmail ? 'border-red-500' : ''}
                        />
                        {errors.contactEmail && (
                            <p className="text-sm text-red-600">{errors.contactEmail}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">
                            Teléfono de contacto
                        </Label>
                        <Input
                            id="contactPhone"
                            type="tel"
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            placeholder="+54 11 1234-5678"
                            disabled={isSubmitting}
                            className={errors.contactPhone ? 'border-red-500' : ''}
                        />
                        {errors.contactPhone && (
                            <p className="text-sm text-red-600">{errors.contactPhone}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">
                            Estado *
                        </Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleInputChange('status', value as Company['status'])}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Activa</SelectItem>
                                <SelectItem value="inactive">Inactiva</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-red-600">{errors.status}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (company ? 'Guardar cambios' : 'Crear empresa')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}