import Layout from "@/react-app/components/Layout";
import { useTheme } from "@/react-app/contexts/ThemeContext";
import { Palette, Bell, Sun, Moon, Type } from "lucide-react";

const colorPresets = [
  { name: "Roxo", primary: "#8B5CF6", secondary: "#EC4899" },
  { name: "Azul", primary: "#3B82F6", secondary: "#06B6D4" },
  { name: "Verde", primary: "#10B981", secondary: "#14B8A6" },
  { name: "Laranja", primary: "#F59E0B", secondary: "#EF4444" },
  { name: "Rosa", primary: "#EC4899", secondary: "#F472B6" },
  { name: "Índigo", primary: "#6366F1", secondary: "#8B5CF6" },
];

const fontOptions = [
  "Inter",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Playfair Display",
];

export default function Settings() {
  const { settings, updateSettings } = useTheme();

  async function handleThemeChange(theme: string) {
    await updateSettings({ theme });
  }

  async function handleColorChange(primary: string, secondary: string) {
    await updateSettings({ primary_color: primary, secondary_color: secondary });
  }

  async function handleFontChange(font: string) {
    await updateSettings({ font_family: font });
  }

  async function handleNotificationsToggle() {
    await updateSettings({ notifications_enabled: settings.notifications_enabled ? 0 : 1 });
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Configurações</h1>

        {/* Theme Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              {settings.theme === "light" ? (
                <Sun className="w-6 h-6 text-purple-600" />
              ) : (
                <Moon className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Tema</h2>
              <p className="text-sm text-gray-600">Escolha entre claro e escuro</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                settings.theme === "light"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Sun className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Claro</p>
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                settings.theme === "dark"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Moon className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Escuro</p>
            </button>
          </div>
        </div>

        {/* Colors Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Palette className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cores</h2>
              <p className="text-sm text-gray-600">Personalize as cores do app</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleColorChange(preset.primary, preset.secondary)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.primary_color === preset.primary
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <p className="font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Font Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Type className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Fonte</h2>
              <p className="text-sm text-gray-600">Escolha a tipografia do app</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fontOptions.map((font) => (
              <button
                key={font}
                onClick={() => handleFontChange(font)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  settings.font_family === font
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ fontFamily: font }}
              >
                <p className="font-medium text-lg mb-1">{font}</p>
                <p className="text-sm text-gray-600">ABC 123</p>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notificações</h2>
                <p className="text-sm text-gray-600">Receba lembretes diários</p>
              </div>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                settings.notifications_enabled ? "bg-purple-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.notifications_enabled ? "translate-x-8" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
