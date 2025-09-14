import { useEffect, useState, useContext, useRef } from "react";
import {
  Menu,
  Mic,
  Search as SearchIcon,
  Upload,
  Video as VideoIcon,
  Loader2,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

interface HeaderProps {
  theme: "dark" | "neon";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "neon">>;
  q: string;
  setQ: React.Dispatch<React.SetStateAction<string>>;
  themeCls: {
    pill: string;
    accent: string;
  };
fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}


export default function Header({
  theme,
  setTheme,
  q,
  setQ,
  fileInputRef,
  handleUpload,
  uploading,
}: HeaderProps) {
  const [countryCode, setCountryCode] = useState<string>("");
  const { user, login, logout } = useContext(AuthContext);

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    }
    if (openMenu) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [openMenu]);

  // Fetch country code and cache
  useEffect(() => {
    const cached = localStorage.getItem("countryCode");
    if (cached) {
      setCountryCode(cached);
      return;
    }
    (async () => {
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data?.country_code) {
          setCountryCode(data.country_code);
          localStorage.setItem("countryCode", data.country_code);
        }
      } catch (err) {
        console.error("Failed to fetch country code", err);
      }
    })();
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 backdrop-blur 
      ${theme === "neon" ? "bg-gradient-to-r from-indigo-900 to-purple-900" : "bg-black/80"}`}
    >
      <div className="w-full px-6 py-3 flex items-center gap-4">
        {/* Menu */}
        <button
          className="p-2 rounded-full hover:bg-white/10 transition"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo + Country Code */}
        <a
          href="/"
          className="flex items-center gap-2 hover:opacity-90 transition"
        >
          <div className="w-7 h-7 rounded-md grid place-items-center bg-gradient-to-r from-red-600 to-indigo-500 shadow-md">
            <VideoIcon className="w-5 h-5 text-white" />
          </div>

          <div className="relative font-roboto font-bold text-xl tracking-tight leading-none">
            <span className="text-indigo-400">AIrStream</span>
            {countryCode && (
              <span className="absolute -top-1 -right-5 text-[10px] font-normal text-gray-400 tracking-wide">
                {countryCode}
              </span>
            )}
          </div>
        </a>

        {/* Search Bar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex w-full max-w-2xl items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="flex-1 h-10 px-4 text-sm bg-gray-900 border border-gray-700 rounded-l-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="button"
              className="h-10 w-12 flex items-center justify-center bg-gray-800 border border-l-0 border-gray-700 rounded-r-full hover:bg-gray-700 transition"
            >
              <SearchIcon className="w-4 h-4 text-gray-200" />
            </button>
            <button
              type="button"
              className="ml-2 h-10 w-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition"
              title="Voice Search"
            >
              <Mic className="w-5 h-5 text-gray-200" />
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "neon" : "dark"))}
          className={`px-4 h-9 rounded-full text-sm font-medium transition
            ${theme === "neon"
              ? "bg-black text-cyan-400 shadow-[0_0_10px_#00f2ff,0_0_20px_#00f2ff]"
              : "bg-gray-800 text-white hover:bg-gray-700"}`}
        >
          {theme === "dark" ? "Neon mode" : "Dark mode"}
        </button>

        {/* Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`ml-2 px-4 h-9 rounded-full flex items-center gap-2 text-sm font-medium transition ${
            uploading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Upload
            </>
          )}
        </button>

        {/* Auth Section */}
        <div className="ml-3 relative" ref={menuRef}>
          {user ? (
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="relative"
              title={user.displayName || user.email || "Account"}
            >
              <img
                src={user.photoURL || ""}
                alt="avatar"
                className="w-9 h-9 rounded-full border border-white/10"
              />
            </button>
          ) : (
            <button
              onClick={login}
              className="px-4 h-9 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
            >
              Sign in
            </button>
          )}

          {/* Dropdown */}
          {user && openMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || ""}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border border-white/10"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{user.displayName || "User"}</p>
                    <p className="text-gray-400 text-xs">{user.email || ""}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
