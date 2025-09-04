import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Eye, EyeOff, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
export default function Landing() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const loginMutation = useMutation({
        mutationFn: async (loginData) => {
            return apiRequest("/api/auth/login", {
                method: "POST",
                body: JSON.stringify(loginData), // <-- ini perbaikan
            });
        },
        onSuccess: () => {
            toast({
                title: "Login Berhasil",
                description: "Selamat datang di CafePos!",
            });
            window.location.reload();
        },
        onError: (error) => {
            toast({
                title: "Login Gagal",
                description: error.message || "Username atau password salah",
                variant: "destructive",
            });
        },
    });
    const handleLogin = (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast({
                title: "Error",
                description: "Username dan password harus diisi",
                variant: "destructive",
            });
            return;
        }
        loginMutation.mutate({ username, password });
    };
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-400 to-coffee-600 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-coffee-500 rounded-full flex items-center justify-center">
            <Coffee className="text-white" size={28}/>
          </div>
          <CardTitle className="text-2xl font-bold text-coffee-800">CafePos</CardTitle>
          <p className="text-coffee-600 text-sm">Sistem Kasir Cafe Modern</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-coffee-700">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400" size={18}/>
                <Input id="username" type="text" placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 border-coffee-200 focus:border-coffee-400" disabled={loginMutation.isPending}/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-coffee-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400" size={18}/>
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 border-coffee-200 focus:border-coffee-400" disabled={loginMutation.isPending}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-400 hover:text-coffee-600">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-coffee-500 hover:bg-coffee-600 text-white py-2.5 mt-6" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Memproses..." : "Masuk ke Sistem"}
            </Button>
          </form>

          <div className="bg-coffee-100 p-4 rounded-lg mt-6">
            <p className="text-coffee-800 text-sm font-medium mb-2">Akun Demo:</p>
            <div className="space-y-1 text-xs text-coffee-600">
              <p><strong>Admin:</strong> username: admin, password: admin123</p>
              <p><strong>Kasir:</strong> username: kasir, password: kasir123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
