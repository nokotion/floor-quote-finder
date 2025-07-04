import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Building } from 'lucide-react';

const isDev = import.meta.env.VITE_DEV_MODE === 'true';

const TEST_ACCOUNTS = [
  {
    type: 'retailer',
    email: 'retailer1@test.com',
    password: 'password123',
    name: 'John Smith (Test Flooring)',
    description: '10 lead credits, all brands',
    icon: Building,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    type: 'retailer',
    email: 'retailer2@test.com', 
    password: 'password123',
    name: 'Sarah Johnson (Premium Floor)',
    description: '15 lead credits, installation only',
    icon: Building,
    color: 'bg-green-100 text-green-800'
  },
  {
    type: 'retailer',
    email: 'retailer3@test.com',
    password: 'password123', 
    name: 'Mike Wilson (Budget Floors)',
    description: '0 credits (tests Stripe)',
    icon: Building,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    type: 'admin',
    email: 'admin@pricefloor.dev',
    password: 'admin123',
    name: 'Admin User',
    description: 'Full admin access',
    icon: Shield,
    color: 'bg-red-100 text-red-800'
  }
];

interface DevLoginPanelProps {
  onLogin?: () => void;
}

export const DevLoginPanel: React.FC<DevLoginPanelProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleTestLogin = async (account: typeof TEST_ACCOUNTS[0]) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        console.error('Login error:', error);
        alert(`Login failed: ${error.message}\n\nYou may need to create this account first in Supabase Auth.`);
        return;
      }

      console.log(`Logged in as ${account.name}`);
      
      // Navigate based on account type
      if (account.type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/retailer');
      }
      
      onLogin?.();
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const createTestAccounts = async () => {
    let created = 0;
    let errors = 0;

    for (const account of TEST_ACCOUNTS) {
      try {
        const { error } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              first_name: account.name.split(' ')[0],
              last_name: account.name.split(' ')[1] || '',
              role: account.type === 'admin' ? 'admin' : 'retailer'
            }
          }
        });

        if (error && !error.message.includes('already registered')) {
          console.error(`Error creating ${account.email}:`, error);
          errors++;
        } else {
          created++;
        }
      } catch (error) {
        console.error(`Error creating ${account.email}:`, error);
        errors++;
      }
    }

    alert(`Account creation complete!\nCreated: ${created}\nErrors: ${errors}\n\nNote: You may need to manually confirm emails in Supabase Auth.`);
  };

  if (!isDev) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center gap-2">
          <User className="w-5 h-5" />
          Development Mode - Test Accounts
        </CardTitle>
        <p className="text-sm text-orange-600">
          Quick login for testing. Remove VITE_DEV_MODE=true in production.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TEST_ACCOUNTS.map((account, index) => {
            const IconComponent = account.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${account.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-xs text-gray-600">{account.description}</div>
                    <div className="text-xs text-gray-500">{account.email}</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleTestLogin(account)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Login
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={createTestAccounts}
            className="w-full text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            Create All Test Accounts
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Run this once to create accounts, then use login buttons above
          </p>
        </div>
      </CardContent>
    </Card>
  );
};