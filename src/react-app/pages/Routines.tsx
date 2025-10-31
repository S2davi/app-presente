import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { Plus, Check, Dumbbell, Sparkles, Utensils, Clock, Trash2 } from "lucide-react";
import type { Routine } from "@/shared/types";

const iconOptions = [
  { value: "dumbbell", icon: Dumbbell, label: "Exercício" },
  { value: "sparkles", icon: Sparkles, label: "Cuidados" },
  { value: "utensils", icon: Utensils, label: "Alimentação" },
];

export default function Routines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: "",
    category: "Exercício",
    icon: "dumbbell",
    reminder_time: "",
  });

  useEffect(() => {
    fetchRoutines();
    fetchCompletions();
  }, []);

  async function fetchRoutines() {
    try {
      const response = await fetch("/api/routines");
      if (response.ok) {
        const data = await response.json();
        setRoutines(data);
      }
    } catch (error) {
      console.error("Failed to fetch routines:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCompletions() {
    try {
      const response = await fetch("/api/routines/completions?days=1");
      if (response.ok) {
        const data = await response.json();
        const today = new Date().toISOString().split("T")[0];
        const completed = new Set<number>(
          data
            .filter((c: any) => c.completed_date === today)
            .map((c: any) => c.routine_id as number)
        );
        setCompletedToday(completed);
      }
    } catch (error) {
      console.error("Failed to fetch completions:", error);
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoutine),
      });

      if (response.ok) {
        setShowModal(false);
        setNewRoutine({ title: "", category: "Exercício", icon: "dumbbell", reminder_time: "" });
        fetchRoutines();
      }
    } catch (error) {
      console.error("Failed to create routine:", error);
    }
  }

  async function handleComplete(id: number) {
    try {
      const response = await fetch(`/api/routines/${id}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        setCompletedToday((prev) => new Set([...prev, id]));
      }
    } catch (error) {
      console.error("Failed to complete routine:", error);
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRoutines((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete routine:", error);
    }
  }

  function getIcon(iconName: string) {
    const option = iconOptions.find((opt) => opt.value === iconName);
    return option ? option.icon : Sparkles;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Carregando rotinas...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Rotinas Diárias</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nova Rotina
          </button>
        </div>

        <div className="grid gap-4">
          {routines.map((routine) => {
            const Icon = getIcon(routine.icon);
            const isCompleted = completedToday.has(routine.id);

            return (
              <div
                key={routine.id}
                className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-200 ${
                  isCompleted ? "opacity-60" : "hover:shadow-xl"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-green-100" : "bg-purple-100"
                    }`}>
                      <Icon className={`w-6 h-6 ${isCompleted ? "text-green-600" : "text-purple-600"}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{routine.title}</h3>
                      <p className="text-sm text-gray-600">{routine.category}</p>
                      {routine.reminder_time && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {routine.reminder_time}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(routine.id)}
                        className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {routines.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma rotina criada ainda</p>
              <p className="text-sm text-gray-400 mt-2">Clique em "Nova Rotina" para começar</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Nova Rotina</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newRoutine.title}
                  onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Treino matinal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={newRoutine.category}
                  onChange={(e) => setNewRoutine({ ...newRoutine, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>Exercício</option>
                  <option>Cuidados Pessoais</option>
                  <option>Alimentação</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                <div className="grid grid-cols-3 gap-2">
                  {iconOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setNewRoutine({ ...newRoutine, icon: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          newRoutine.icon === option.value
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Lembrete (opcional)</label>
                <input
                  type="time"
                  value={newRoutine.reminder_time}
                  onChange={(e) => setNewRoutine({ ...newRoutine, reminder_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                disabled={!newRoutine.title}
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
