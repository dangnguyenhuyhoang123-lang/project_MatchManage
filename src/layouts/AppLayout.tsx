import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container } from "../utils/Container";
import { Sidebar } from "../utils/SideBar";
import { useAuth } from "../utils/useAuth";
import LoadingSpinner from "../components/Spinner/LoadingSpinner";
import NotificationService from "../services/websocket/NotificationService";
import NotificationSocketService, {
  type NotificationDTO,
} from "../services/websocket/NotificationSocketService";

export type AppWorkspace = "public" | "admin" | "club";

interface AppLayoutProps {
  children: ReactNode;
  workspace?: AppWorkspace;
}

const AppLayoutContext = createContext(false);

const legacyClubPaths = [
  "/manageMatchClub",
  "/manageInfoClub",
  "/managePlayerClub",
  "/manageCoachClub",
  "/manageStadiumClub",
  "/registrations",
];

function resolveWorkspace(pathname: string, workspace?: AppWorkspace) {
  if (workspace) {
    return workspace;
  }

  if (pathname.startsWith("/club") || legacyClubPaths.includes(pathname)) {
    return "club";
  }

  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  return "public";
}

function getNotificationIcon(type?: string) {
  switch (type) {
    case "MATCH_CREATED":
      return "sports_soccer";
    case "LINEUP_SUBMITTED":
      return "assignment_turned_in";
    case "LINEUP_UPDATED":
      return "edit_note";
    case "REGISTRATION_APPROVED":
      return "verified";
    case "REGISTRATION_REJECTED":
      return "cancel";
    default:
      return "notifications";
  }
}

function getNotificationIconClass(type?: string) {
  switch (type) {
    case "REGISTRATION_APPROVED":
      return "bg-emerald-100 text-emerald-700";
    case "REGISTRATION_REJECTED":
      return "bg-red-100 text-red-600";
    case "LINEUP_SUBMITTED":
      return "bg-blue-100 text-blue-700";
    case "LINEUP_UPDATED":
      return "bg-amber-100 text-amber-700";
    case "MATCH_CREATED":
      return "bg-[#008C2F]/10 text-[#008C2F]";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

export const AppLayout = ({ children, workspace }: AppLayoutProps) => {
  const alreadyInsideAppLayout = useContext(AppLayoutContext);
  const location = useLocation();
  const currentWorkspace = resolveWorkspace(location.pathname, workspace);
  const { loading, user } = useAuth(); // Gộp chung destructuring từ useAuth

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (alreadyInsideAppLayout) return;
    if (!user?.id || currentWorkspace === "public") {
      NotificationSocketService.disconnect();
      return;
    }

    NotificationService.getByUser(user.id)
      .then((res) => {
        const raw = res.data as any;

        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.content)
              ? raw.content
              : [];

        setNotifications(list);
      })
      .catch((err) => console.error("Cannot load notifications", err));

    NotificationService.countUnread(user.id)
      .then((res) => setUnreadCount(res.data))
      .catch((err) => console.error("Cannot count unread notifications", err));

    NotificationSocketService.connect(
      user.id,
      (notification) => {
        console.log("New notification:", notification);
        window.dispatchEvent(
          new CustomEvent("app-notification", {
            detail: notification,
          }),
        );

        setNotifications((prev) => {
          const existed = prev.some((item) => item.id === notification.id);
          if (existed) return prev;
          return [notification, ...prev];
        });

        if (!notification.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      },
      (event) => {
        console.log("New realtime event:", event);
        window.dispatchEvent(
          new CustomEvent("app-realtime-event", {
            detail: event,
          }),
        );
      },
    );

    return () => {
      NotificationSocketService.disconnect();
    };
  }, [alreadyInsideAppLayout, currentWorkspace, user?.id]);

  const handleNotificationClick = async (item: NotificationDTO) => {
    try {
      if (!item.isRead) {
        await NotificationService.markAsRead(item.id);

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === item.id
              ? { ...notification, isRead: true }
              : notification,
          ),
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Cannot mark notification as read", error);
    }

    setNotificationOpen(false);

    if (item.type === "MATCH_CREATED") {
      navigate("/club/matches", {
        state: { matchId: item.referenceId },
      });
      return;
    }

    if (item.type === "LINEUP_SUBMITTED" || item.type === "LINEUP_UPDATED") {
      navigate("/admin/matches", {
        state: { matchId: item.referenceId },
      });
      return;
    }

    if (
      item.type === "REGISTRATION_APPROVED" ||
      item.type === "REGISTRATION_REJECTED"
    ) {
      navigate("/club/registrations", {
        state: { registrationId: item.referenceId },
      });
      return;
    }

    if (item.referenceType === "MATCH") {
      navigate("/club/matches", {
        state: { matchId: item.referenceId },
      });
      return;
    }

    if (item.referenceType === "MATCH_LINEUP") {
      navigate("/admin/matches", {
        state: { matchId: item.referenceId },
      });
      return;
    }

    if (item.referenceType === "REGISTRATION_TEAM") {
      navigate("/club/registrations", {
        state: { registrationId: item.referenceId },
      });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (alreadyInsideAppLayout) {
    return <>{children}</>;
  }

  if (currentWorkspace === "public") {
    return (
      <AppLayoutContext.Provider value>
        <div className="min-h-screen bg-[#fbf9f5] font-sans text-gray-950">
          {children}
        </div>
      </AppLayoutContext.Provider>
    );
  }

  const isClubArea = currentWorkspace === "club";
  const areaLabel = isClubArea ? "Club Workspace" : "Admin Workspace";

  const homePath = isClubArea ? "/club/dashboard" : "/admin/leagues";
  const accountLabel = isClubArea ? "Quản lý CLB" : "Quản trị viên";

  return (
    <AppLayoutContext.Provider value>
      <div className="min-h-screen bg-[#fbf9f5] font-['Be_Vietnam_Pro'] text-gray-950">
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
          rel="stylesheet"
        />

        <div className="mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 px-3 sm:px-4 lg:px-6">
          <Sidebar workspace={currentWorkspace} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 border-b border-gray-100 bg-[#fbf9f5]/90 py-4 backdrop-blur">
              <Container size="xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <Link to="/" className="hover:text-[#008C2F]">
                        Trang chủ
                      </Link>
                      <span className="material-symbols-outlined text-sm">
                        chevron_right
                      </span>
                      <Link to={homePath} className="text-[#008C2F]">
                        {areaLabel}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setNotificationOpen((prev) => !prev)}
                        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:text-[#008C2F]"
                        title="Thông báo"
                      >
                        <span className="material-symbols-outlined text-xl">
                          notifications
                        </span>

                        {unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </button>

                      {notificationOpen && (
                        <div className="absolute right-0 top-12 z-50 w-[420px] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
                          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                              <p className="text-sm font-black text-gray-950">
                                Thông báo
                              </p>
                              <p className="mt-0.5 text-xs font-semibold text-gray-400">
                                {unreadCount} thông báo chưa đọc
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setNotificationOpen(false)}
                              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                              <span className="material-symbols-outlined text-lg">
                                close
                              </span>
                            </button>
                          </div>

                          <div className="max-h-[420px] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-5 py-8 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                  <span className="material-symbols-outlined">
                                    notifications_off
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-gray-500">
                                  Chưa có thông báo nào.
                                </p>
                              </div>
                            ) : (
                              notifications.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleNotificationClick(item)}
                                  className={`block w-full border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 ${
                                    item.isRead ? "bg-white" : "bg-green-50/70"
                                  }`}
                                >
                                  <div className="flex gap-3">
                                    <div
                                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getNotificationIconClass(
                                        item.type,
                                      )}`}
                                    >
                                      <span className="material-symbols-outlined text-[20px]">
                                        {getNotificationIcon(item.type)}
                                      </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="line-clamp-1 text-sm font-black text-gray-900">
                                          {item.title}
                                        </p>

                                        {!item.isRead && (
                                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                        )}
                                      </div>

                                      <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-gray-500">
                                        {item.content}
                                      </p>

                                      <p className="mt-2 text-[11px] font-bold text-gray-400">
                                        {item.createdAt
                                          ? new Date(
                                              item.createdAt,
                                            ).toLocaleString("vi-VN")
                                          : "Vừa xong"}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      to={homePath}
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:text-[#008C2F]"
                    >
                      <span className="material-symbols-outlined text-base">
                        {isClubArea ? "shield" : "admin_panel_settings"}
                      </span>
                      {accountLabel}
                    </Link>
                  </div>
                </div>
              </Container>
            </header>

            <main className="flex-1 py-6">
              <Container size="xl">{children}</Container>
            </main>
          </div>
        </div>
      </div>
    </AppLayoutContext.Provider>
  );
};
