
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminUsers = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">User management functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
