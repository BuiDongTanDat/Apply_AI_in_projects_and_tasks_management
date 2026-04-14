import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useCookie } from "@/hooks/logic/useCookie";
import { useLocalStorage } from "@/hooks/logic/useLocalStorage";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Landing.scss";
import {
  Zap,
  ArrowRight,
  Rocket,
  PlayCircle,
  LayoutGrid,
  Bot,
  CheckCircle,
  Users,
  Plus,
  MessageCircle,
  Brain,
  GitBranch,
  BarChart3,
  Sparkles,
  UserCheck,
  ClipboardCheck,
  ArrowDown,
  Wand2,
  Command,
  Bell,
  MessageSquare as Thread,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [token] = useCookie("access_token", "");
  const [userId] = useLocalStorage("user_id", "");

  const handleEnterApp = () => {
    if (token && userId) {
      navigate("/team");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
    });

    const navbar = document.getElementById("navbar");
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add("shadow-md");
        navbar?.classList.replace("glass-effect", "bg-white/95");
      } else {
        navbar?.classList.remove("shadow-md");
        navbar?.classList.replace("bg-white/95", "glass-effect");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="landing-page bg-gray-50 text-gray-900 overflow-x-hidden min-h-screen">
      {/* Navigation */}
      <nav
        className="fixed w-full z-50 glass-effect transition-all duration-300"
        id="navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center space-x-2"
              data-aos="fade-down"
              style={{ cursor: "pointer" }}
              onClick={() => window.scrollTo(0, 0)}
            >
              <div className="w-10 h-10 rounded-xl card-gradient flex items-center justify-center">
                <Zap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                TaskFlow AI
              </span>
            </div>

            <div
              className="hidden md:flex items-center space-x-8"
              data-aos="fade-down"
              data-aos-delay="100"
            >
              <a
                href="#features"
                onClick={(e) => handleScrollTo(e, "#features")}
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Features
              </a>
              <a
                href="#ai-automation"
                onClick={(e) => handleScrollTo(e, "#ai-automation")}
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                AI Automation
              </a>
              <a
                href="#discord"
                onClick={(e) => handleScrollTo(e, "#discord")}
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Discord Sync
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleScrollTo(e, "#pricing")}
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Pricing
              </a>
            </div>

            <div
              data-aos="fade-down"
              data-aos-delay="200"
              className="flex items-center space-x-4"
            >
              <button
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-gray-900 font-medium transition hidden sm:block"
              >
                Sign In
              </button>
              <button
                onClick={handleEnterApp}
                className="btn-primary text-white px-6 py-3 rounded-full font-semibold inline-flex items-center space-x-2 pulse-ring"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50"></div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right" data-aos-duration="1000">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-6 border border-gray-200">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-gray-700">
                  100% Free Forever • No Credit Card Required
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                Smart Task Management <br />
                <span className="gradient-text">Powered by AI</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Automate task creation, assignment, and evaluation with AI. Sync
                seamlessly with Discord. Completely free, no hidden costs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={handleEnterApp}
                  className="btn-primary text-white px-8 py-4 rounded-full font-bold text-lg inline-flex items-center justify-center space-x-2 pulse-ring"
                >
                  <span>Launch Dashboard</span>
                  <Rocket className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleScrollTo(e as any, "#features")}
                  className="bg-white text-gray-700 px-8 py-4 rounded-full font-bold text-lg inline-flex items-center justify-center space-x-2 border-2 border-gray-200 hover:border-gray-300 transition shadow-sm hover:shadow-md"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Learn More</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  <img
                    src="https://i.pravatar.cc/100?img=1"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="User"
                  />
                  <img
                    src="https://i.pravatar.cc/100?img=2"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="User"
                  />
                  <img
                    src="https://i.pravatar.cc/100?img=3"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="User"
                  />
                  <img
                    src="https://i.pravatar.cc/100?img=4"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="User"
                  />
                </div>
                <span>
                  Trusted by <strong className="text-gray-900">10,000+</strong>{" "}
                  teams worldwide
                </span>
              </div>
            </div>

            <div
              className="relative"
              data-aos="fade-left"
              data-aos-duration="1000"
            >
              <div className="relative floating">
                <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between group hover:shadow-md transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            AI Task Analysis
                          </h4>
                          <p className="text-sm text-gray-500">
                            Auto-assigning to team...
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-400 line-through">
                          Review Q3 Reports
                        </h4>
                        <p className="text-sm text-green-600">
                          Completed by AI • 2m ago
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Team Sync Meeting
                        </h4>
                        <p className="text-sm text-gray-500">
                          Today, 3:00 PM • Discord
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Live
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Plus className="w-5 h-5 mr-2" />
                      <span className="text-sm">Create new task with AI</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full discord-gradient flex items-center justify-center">
                      <MessageCircle className="text-white w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Discord Synced
                      </p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Task Management Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm mb-4">
              Smart Features
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Intelligent Task Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Organize, prioritize, and execute tasks with unprecedented
              efficiency using our smart workflow engine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className="feature-card bg-gray-50 rounded-3xl p-8 border border-gray-100"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Prioritization</h3>
              <p className="text-gray-600 leading-relaxed">
                AI automatically prioritizes tasks based on deadlines,
                importance, and your team's workload capacity.
              </p>
            </div>

            <div
              className="feature-card bg-gray-50 rounded-3xl p-8 border border-gray-100"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
                <GitBranch className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Workflows</h3>
              <p className="text-gray-600 leading-relaxed">
                Kanban boards, Gantt charts, and list views that adapt to your
                team's preferred working style.
              </p>
            </div>

            <div
              className="feature-card bg-gray-50 rounded-3xl p-8 border border-gray-100"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-cyan-200">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track productivity metrics, completion rates, and team
                performance with beautiful dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Automation Section */}
      <section
        id="ai-automation"
        className="py-20 bg-gray-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-4">
                AI-Powered
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Automate Everything <br />
                <span className="ai-gradient-text">With Intelligence</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Let AI handle the heavy lifting. From task creation to final
                evaluation, experience true automation.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">AI Task Creation</h4>
                    <p className="text-gray-600">
                      Describe your goal in natural language, and AI generates
                      structured tasks with subtasks automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <UserCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Smart Assignment</h4>
                    <p className="text-gray-600">
                      AI analyzes team skills, workload, and availability to
                      assign tasks to the perfect team member.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <ClipboardCheck className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">
                      Automated Evaluation
                    </h4>
                    <p className="text-gray-600">
                      Quality checks, completion verification, and performance
                      scoring handled automatically by AI.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative" data-aos="fade-left">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">AI Task Generator</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    LIVE
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Input:</p>
                    <p className="text-gray-900 font-medium">
                      "Launch new marketing campaign for Q4 including social
                      media, email, and blog content"
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="w-6 h-6 text-gray-400 animate-bounce" />
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100 space-y-3">
                    <p className="text-sm text-gray-500 mb-2">
                      AI Generated Tasks:
                    </p>

                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium flex-1">
                        Create social media calendar
                      </span>
                      <span className="text-xs text-gray-500">2 days</span>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium flex-1">
                        Draft email sequences
                      </span>
                      <span className="text-xs text-gray-500">3 days</span>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium flex-1">
                        Write blog posts (x4)
                      </span>
                      <span className="text-xs text-gray-500">5 days</span>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium flex-1">
                        Design campaign assets
                      </span>
                      <span className="text-xs text-gray-500">4 days</span>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
                    <Wand2 className="w-5 h-5" />
                    <span>Accept & Assign Tasks</span>
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 -right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              <div className="absolute -z-10 bottom-0 -left-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Discord Sync Section */}
      <section id="discord" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative" data-aos="fade-right">
              <div className="bg-[#36393f] rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="bg-[#202225] px-4 py-3 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-gray-400 text-sm">
                      Discord • TaskFlow Bot
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src="https://i.pravatar.cc/100?img=5"
                      className="w-10 h-10 rounded-full"
                      alt="Bot"
                    />
                    <div className="bg-[#40444b] rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
                      <p className="text-gray-100 text-sm">
                        🎯 <strong>New Task Assigned</strong>
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        Website redesign project • Due tomorrow
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button className="px-3 py-1 bg-[#5865F2] text-white text-xs rounded hover:bg-[#4752C4] transition">
                          View Task
                        </button>
                        <button className="px-3 py-1 bg-[#4f545c] text-white text-xs rounded hover:bg-[#686d73] transition">
                          Mark Done
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 flex-row-reverse">
                    <img
                      src="https://i.pravatar.cc/100?img=6"
                      className="w-10 h-10 rounded-full"
                      alt="User"
                    />
                    <div className="bg-[#5865F2] rounded-2xl rounded-tr-none px-4 py-3 max-w-sm">
                      <p className="text-white text-sm">
                        !task create "Update API documentation" @dev-team
                        priority:high
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <img
                      src="https://i.pravatar.cc/100?img=5"
                      className="w-10 h-10 rounded-full"
                      alt="Bot"
                    />
                    <div className="bg-[#40444b] rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
                      <p className="text-gray-100 text-sm">
                        ✅ <strong>Task Created Successfully</strong>
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        "Update API documentation" has been created and assigned
                        to @dev-team with high priority.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Task ID: #2847 • View in dashboard
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 py-2">
                    <div className="h-px bg-gray-700 flex-1"></div>
                    <span className="text-xs text-gray-500">
                      Synced in real-time
                    </span>
                    <div className="h-px bg-gray-700 flex-1"></div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Bi-directional Sync
                    </p>
                    <p className="text-xs text-gray-500">Updates in 50ms</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2" data-aos="fade-left">
              <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm mb-4">
                Discord Integration
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Real-time Discord <br />
                <span className="discord-gradient-text">Synchronization</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Manage tasks without leaving Discord. Create, assign, and track
                tasks directly from your server with our intelligent bot.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-lg discord-gradient flex items-center justify-center text-white">
                    <Command className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Slash Commands
                    </h4>
                    <p className="text-sm text-gray-600">
                      /task, /assign, /status - Full control via commands
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-lg discord-gradient flex items-center justify-center text-white">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Instant Notifications
                    </h4>
                    <p className="text-sm text-gray-600">
                      Get notified in Discord when tasks update
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-lg discord-gradient flex items-center justify-center text-white">
                    <Thread className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Thread Integration
                    </h4>
                    <p className="text-sm text-gray-600">
                      Auto-create threads for task discussions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12" data-aos="fade-up">
            <span className="inline-block px-4 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold text-sm mb-4">
              Pricing
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Free to Use, Upgrade to Unlock More
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start using TaskFlow AI completely free. Upgrade anytime to unlock
              premium features.
            </p>
          </div>

          {/* Single Pricing Card */}
          <div
            className="max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl">
              {/* Free Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Free Forever
              </div>

              {/* Current Plan - Free */}
              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold mb-2">
                  You're on the Free Plan
                </h3>
                <p className="text-gray-400">
                  Enjoy essential features at no cost
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Free Features */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="font-semibold text-green-400">
                      Included Free
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Up to 5 team members
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      3 active projects
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      500 MB storage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Basic task management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Kanban & List views
                    </li>
                  </ul>
                </div>

                {/* Premium Features - Locked */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl p-6 border border-indigo-400/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="font-semibold text-indigo-400">
                      Unlock with Pro
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                      AI Assistant & Auto-assign
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                      Advanced Analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <Users className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                      Unlimited members & projects
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <Command className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                      API Access & Integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                      Priority Support
                    </li>
                  </ul>
                </div>
              </div>

              {/* Upgrade Section */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-2xl p-6 border border-indigo-400/30 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold mb-1">Upgrade to Pro</h4>
                    <p className="text-gray-400 text-sm">
                      Unlock all features and supercharge your workflow
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">299K₫</div>
                      <div className="text-xs text-gray-400">per month</div>
                    </div>
                    <button
                      onClick={() => navigate("/plans")}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition flex items-center gap-2 whitespace-nowrap"
                    >
                      <Rocket className="w-4 h-4" />
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEnterApp}
                  className="flex-1 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Continue with Free
                </button>
                <button
                  onClick={() => navigate("/plans")}
                  className="flex-1 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition border border-white/20 flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  Compare All Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-aos="fade-up"
        >
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Ready to Transform Your <br />
            <span className="gradient-text">Task Management?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of teams already using TaskFlow AI to automate their
            workflows and boost productivity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleEnterApp}
              className="btn-primary text-white px-10 py-5 rounded-full font-bold text-xl inline-flex items-center space-x-3 pulse-ring shadow-2xl shadow-indigo-200"
            >
              <span>Launch Free Dashboard</span>
              <Rocket className="w-6 h-6" />
            </button>
          </div>

          <p className="mt-6 text-gray-500 text-sm">
            Takes less than 30 seconds to get started • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg card-gradient flex items-center justify-center">
                  <Zap className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  TaskFlow AI
                </span>
              </div>
              <p className="text-gray-600 max-w-sm">
                The most intelligent task management platform, completely free.
                Powered by AI, synced with Discord, built for modern teams.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleScrollTo(e, "#features")}
                    className="hover:text-gray-900 transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#discord"
                    onClick={(e) => handleScrollTo(e, "#discord")}
                    className="hover:text-gray-900 transition"
                  >
                    Discord Bot
                  </a>
                </li>
                <li>
                  <a
                    href="#ai-automation"
                    onClick={(e) => handleScrollTo(e, "#ai-automation")}
                    className="hover:text-gray-900 transition"
                  >
                    AI Automation
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    onClick={(e) => handleScrollTo(e, "#pricing")}
                    className="hover:text-gray-900 transition"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 TaskFlow AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
