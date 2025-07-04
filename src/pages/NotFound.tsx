import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found - Price My Floor</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      <div className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p className="text-gray-600 mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NotFound;
