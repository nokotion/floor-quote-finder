
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminBrands = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
          <CardDescription>
            Manage flooring brands and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Brand management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrands;
