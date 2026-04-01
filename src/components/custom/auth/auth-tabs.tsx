import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card';
import Login from './login';
import Signup from './signup';

const AuthTabs: React.FC = () => {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <div className="relative min-h-[500px]">
          <TabsContent value="login" className="absolute inset-0">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <Login />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup" className="absolute inset-0">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create a new account to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <Signup />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
export default AuthTabs;
