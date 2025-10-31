import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { Plus, CheckSquare, Square, Target, Trophy, Heart, Brain, Trash2 } from "lucide-react";
import type { Goal } from "@/shared/types";

const iconOptions = [
  { value: "target", icon: Target, label: "Meta" },
  { value: "trophy", icon: Trophy, label: "Conquista" },
  { value: "heart", icon: Heart, label: "Saúde" },
  { value: "brain", icon: Brain, label: "Mental" },
];

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<Record<number, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    icon: "target",
    target_frequency: 7,
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
        
        // Fetch progress for each goal
        for (const goal of data) {
          fetchProgress(goal.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProgress(goalId: number) {
    try {
      const response = await fetch(`/api/goals/${goalId}/progress?days=7`);
      if (response.ok) {
        const data = await response.json();
        setProgress((prev) => ({ ...prev, [goalId]: data }));
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (response.ok) {
        setShowModal(false);
        setNewGoal({ title: "", description: "", icon: "target", target_frequency: 7 });
        fetchGoals();
      }
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  }

  async function handleToggle(goalId: number) {
    const today = new Date().toISOString().split("T")[0];
    const todayProgress = progress[goalId]?.find((p: any) => p.completed_date === today);

    try {
      if (todayProgress) {
        await fetch(`/api/goals/${goalId}/progress`, {
          method: "DELETE",
        });
      } else {
        await fetch(`/api/goals/${goalId}/progress`, {
          method: "POST",
        });
      }
      fetchProgress(goalId);
    } catch (error) {
      console.error("Failed to toggle progress:", error);
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGoals((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  }

  function getIcon(iconName: string) {
    const option = iconOptions.find((opt) => opt.value === iconName);
    return option ? option.icon : Target;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Carregando metas...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Metas</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </button>
        </div>

        <div className="grid gap-4">
          {goals.map((goal) => {
            const Icon = getIcon(goal.icon);
            const today = new Date().toISOString().split("T")[0];
            const isCompletedToday = progress[goal.id]?.some((p: any) => p.completed_date === today);
            const weekProgress = progress[goal.id]?.length || 0;
            const progressPercent = (weekProgress / goal.target_frequency) * 100;

            return (
              <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompletedToday ? "bg-green-100" : "bg-pink-100"
                    }`}>
                      <Icon className={`w-6 h-6 ${isCompletedToday ? "text-green-600" : "text-pink-600"}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {weekProgress}/{goal.target_frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(goal.id)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      {isCompletedToday ? (
                        <CheckSquare className="w-6 h-6 text-green-600" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma meta criada ainda</p>
              <p className="text-sm text-gray-400 mt-2">Clique em "Nova Meta" para começar</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Nova Meta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Meditar diariamente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva sua meta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setNewGoal({ ...newGoal, icon: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          newGoal.icon === option.value
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto" />
                        <p className="text-xs mt-1">{option.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta semanal: {newGoal.target_frequency} dias
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={newGoal.target_frequency}
                  onChange={(e) => setNewGoal({ ...newGoal, target_frequency: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newGoal.title}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
