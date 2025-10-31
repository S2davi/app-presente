import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { Loader2, Sparkles, Target, BookHeart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardStats } from "@/shared/types";
import Layout from "@/react-app/components/Layout";
import StatCard from "@/react-app/components/StatCard";
import ProgressChart from "@/react-app/components/ProgressChart";

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && user) {
      fetchDashboard();
    } else if (!isPending && !user) {
      setIsLoading(false);
    }
  }, [isPending, user]);

  async function fetchDashboard() {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Loader2 className="w-10 h-10" style={{ color: "var(--primary-color)" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Florescer
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Seu aplicativo de bem-estar pessoal e motivação diária
            </p>
            <button
              onClick={redirectToLogin}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Começar Agora
            </button>
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Rotinas Diárias</h3>
                <p className="text-gray-600">Acompanhe suas atividades e conquiste seus objetivos</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Progresso Visual</h3>
                <p className="text-gray-600">Veja seu crescimento através de gráficos animados</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookHeart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Diário Motivacional</h3>
                <p className="text-gray-600">Registre seus pensamentos e conquistas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = user.google_user_data.given_name || user.google_user_data.name || "Você";
  const routineProgress = stats ? (stats.routines.total > 0 ? (stats.routines.completed / stats.routines.total) * 100 : 0) : 0;
  const goalProgress = stats ? (stats.goals.total > 0 ? (stats.goals.completed / stats.goals.total) * 100 : 0) : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Bem-vinda, {userName}!</h1>
          </div>
          <p className="text-purple-100 text-lg">Continue brilhando e alcançando suas metas</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Rotinas Hoje"
            value={`${stats?.routines.completed || 0}/${stats?.routines.total || 0}`}
            progress={routineProgress}
            icon={<Target className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Metas Hoje"
            value={`${stats?.goals.completed || 0}/${stats?.goals.total || 0}`}
            progress={goalProgress}
            icon={<TrendingUp className="w-6 h-6" />}
            color="pink"
          />
          <StatCard
            title="Pontos Semanais"
            value={stats?.weekPoints || 0}
            icon={<Sparkles className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Conquistas"
            value={stats?.achievements || 0}
            icon={<BookHeart className="w-6 h-6" />}
            color="indigo"
          />
        </div>

        <ProgressChart />

        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/routines")}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Rotinas</h3>
            <p className="text-gray-600">Gerencie suas atividades diárias</p>
          </button>

          <button
            onClick={() => navigate("/goals")}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left group"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Metas</h3>
            <p className="text-gray-600">Acompanhe suas conquistas</p>
          </button>

          <button
            onClick={() => navigate("/diary")}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <BookHeart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Diário</h3>
            <p className="text-gray-600">Registre seus pensamentos</p>
          </button>
        </div>
      </div>
    </Layout>
  );
}
