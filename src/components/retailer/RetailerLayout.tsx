
import RetailerSidebar from './RetailerSidebar';
import RetailerHeader from './RetailerHeader';

interface RetailerLayoutProps {
  children: React.ReactNode;
}

const RetailerLayout: React.FC<RetailerLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <RetailerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <RetailerHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RetailerLayout;
