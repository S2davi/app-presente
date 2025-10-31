import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { BookHeart, Sparkles, Smile, Meh, Frown } from "lucide-react";
import type { DiaryEntry } from "@/shared/types";

const motivationalMessages = [
  "Você é mais forte do que imagina! 💪",
  "Cada dia é uma nova oportunidade para brilhar ✨",
  "Acredite no seu potencial infinito 🌟",
  "Você está fazendo um trabalho incrível! 🌈",
  "Sua jornada é única e especial 🦋",
  "Continue sendo essa pessoa maravilhosa 💖",
  "Você merece todas as coisas boas da vida 🌸",
  "Seu progresso é inspirador! 🎯",
  "Mantenha sua luz brilhando forte ☀️",
  "Você é capaz de realizar seus sonhos 🌙",
];

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState("");
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
    setMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
  }, []);

  async function fetchEntries() {
    try {
      const response = await fetch("/api/diary?limit=10");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
        
        const today = new Date().toISOString().split("T")[0];
        const existing = data.find((e: DiaryEntry) => e.entry_date === today);
        if (existing) {
          setTodayEntry(existing.content);
          setTodayMood(existing.mood);
        }
      }
    } catch (error) {
      console.error("Failed to fetch diary entries:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: todayEntry,
          mood: todayMood,
        }),
      });

      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error("Failed to save diary entry:", error);
    }
  }

  const moodOptions = [
    { value: "happy", icon: Smile, label: "Feliz", color: "text-green-600 bg-green-100" },
    { value: "neutral", icon: Meh, label: "Neutro", color: "text-yellow-600 bg-yellow-100" },
    { value: "sad", icon: Frown, label: "Triste", color: "text-blue-600 bg-blue-100" },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Carregando diário...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Diário Motivacional</h1>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Mensagem do Dia</h2>
          </div>
          <p className="text-xl text-purple-100">{motivation}</p>
        </div>

        {/* Today's Entry */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <BookHeart className="w-8 h-8 text-pink-600" />
            <h2 className="text-2xl font-bold">Como foi seu dia hoje?</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Como você está se sentindo?</label>
              <div className="flex gap-3">
                {moodOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTodayMood(option.value)}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        todayMood === option.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${option.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Escreva sobre seu dia</label>
              <textarea
                value={todayEntry}
                onChange={(e) => setTodayEntry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={8}
                placeholder="Compartilhe seus pensamentos, conquistas e reflexões..."
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!todayEntry.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Salvar Registro
            </button>
          </div>
        </div>

        {/* Previous Entries */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Registros Anteriores</h2>
          {entries.slice(1).map((entry) => {
            const date = new Date(entry.entry_date);
            const formattedDate = date.toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            
            const moodOption = moodOptions.find((opt) => opt.value === entry.mood);
            const MoodIcon = moodOption?.icon;

            return (
              <div key={entry.id} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  {MoodIcon && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${moodOption.color}`}>
                      <MoodIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{formattedDate}</h3>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </div>
            );
          })}

          {entries.length <= 1 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum registro anterior</p>
              <p className="text-sm text-gray-400 mt-2">Comece a escrever seu diário hoje!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
