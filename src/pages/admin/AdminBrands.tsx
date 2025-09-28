import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Plus, Save, X } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo_url?: string;
  description?: string;
  categories?: string;
  installation?: string;
  provinces?: string[];
  featured: boolean;
}

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' }
];

const AdminBrands = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('flooring_brands')
        .select('*')
        .order('name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBrand = async (brand: Brand) => {
    try {
      const { error } = await supabase
        .from('flooring_brands')
        .upsert({
          ...brand,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Brand ${brand.name} saved successfully`,
      });

      fetchBrands();
      setEditingBrand(null);
      setIsCreating(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createNewBrand = () => {
    const newBrand: Brand = {
      id: '',
      name: '',
      slug: '',
      website: '',
      logo_url: '',
      description: '',
      categories: '',
      installation: '',
      provinces: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
      featured: false,
    };
    setEditingBrand(newBrand);
    setIsCreating(true);
  };

  const updateEditingBrand = (field: keyof Brand, value: any) => {
    if (editingBrand) {
      setEditingBrand({ ...editingBrand, [field]: value });
    }
  };

  const toggleProvince = (provinceCode: string) => {
    if (!editingBrand) return;
    
    const currentProvinces = editingBrand.provinces || [];
    const updatedProvinces = currentProvinces.includes(provinceCode)
      ? currentProvinces.filter(p => p !== provinceCode)
      : [...currentProvinces, provinceCode];
    
    updateEditingBrand('provinces', updatedProvinces);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
        <Button onClick={createNewBrand}>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {editingBrand && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Brand' : 'Edit Brand'}</CardTitle>
            <CardDescription>
              {isCreating ? 'Add a new flooring brand' : 'Update brand information and provincial availability'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={editingBrand.name}
                  onChange={(e) => {
                    updateEditingBrand('name', e.target.value);
                    // Auto-generate slug from name
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    updateEditingBrand('slug', slug);
                  }}
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editingBrand.website || ''}
                  onChange={(e) => updateEditingBrand('website', e.target.value)}
                  placeholder="https://www.brandwebsite.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingBrand.description || ''}
                onChange={(e) => updateEditingBrand('description', e.target.value)}
                placeholder="Brief description of the brand"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categories">Categories</Label>
                <Input
                  id="categories"
                  value={editingBrand.categories || ''}
                  onChange={(e) => updateEditingBrand('categories', e.target.value)}
                  placeholder="Hardwood, Laminate, Vinyl, etc."
                />
              </div>
              <div>
                <Label htmlFor="installation">Installation</Label>
                <Input
                  id="installation"
                  value={editingBrand.installation || ''}
                  onChange={(e) => updateEditingBrand('installation', e.target.value)}
                  placeholder="Professional, DIY, Both"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={editingBrand.logo_url || ''}
                onChange={(e) => updateEditingBrand('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Provincial Availability</Label>
              <p className="text-sm text-gray-500 mb-3">
                Select the provinces where this brand is available
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {CANADIAN_PROVINCES.map((province) => (
                  <div key={province.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={province.code}
                      checked={editingBrand.provinces?.includes(province.code) || false}
                      onCheckedChange={() => toggleProvince(province.code)}
                    />
                    <Label htmlFor={province.code} className="text-sm">
                      {province.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={editingBrand.featured}
                onCheckedChange={(checked) => updateEditingBrand('featured', checked)}
              />
              <Label htmlFor="featured">Featured Brand</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => saveBrand(editingBrand)}>
                <Save className="w-4 h-4 mr-2" />
                Save Brand
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingBrand(null);
                  setIsCreating(false);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {brands.map((brand) => (
          <Card key={brand.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {brand.name}
                    {brand.featured && <Badge variant="secondary">Featured</Badge>}
                  </CardTitle>
                  <CardDescription>{brand.description}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBrand(brand)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Categories: </span>
                  <span className="text-sm text-gray-600">{brand.categories || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Installation: </span>
                  <span className="text-sm text-gray-600">{brand.installation || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Available in: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {brand.provinces?.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">
                        {code}
                      </Badge>
                    )) || <span className="text-sm text-gray-600">All provinces</span>}
                  </div>
                </div>
                {brand.website && (
                  <div>
                    <span className="text-sm font-medium">Website: </span>
                    <a 
                      href={brand.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {brand.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBrands;