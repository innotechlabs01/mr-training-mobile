/**
 * MR Training — Spanish UI copy (single source of truth).
 *
 * Neutral, professional Spanish (NOT Rioplatense). Every screen imports from
 * here instead of hard-coding literals. English can be added later as a second
 * locale key without restructuring.
 */
export const texts = {
  tabs: {
    today: 'Hoy',
    plan: 'Plan',
    events: 'Eventos',
    recovery: 'Recuperación',
    profile: 'Perfil',
  },
  common: {
    seeAll: 'Ver todo',
    loading: 'Cargando…',
    noData: 'Sin datos',
    retry: 'Reintentar',
    save: 'Guardar',
    cancel: 'Cancelar',
    continue: 'Continuar',
    logout: 'Cerrar sesión',
    back: 'Volver',
    close: 'Cerrar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    today: 'Hoy',
    search: 'Buscar',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    completed: 'Completado',
    pending: 'Pendiente',
  },
  state: {
    errorTitle: 'Ocurrió un error',
    errorMessage: 'Revisa tu conexión e intenta de nuevo',
    emptyTodayTitle: 'No hay sesiones para hoy',
    emptyPlanTitle: 'Aún no tienes sesiones programadas',
    emptyEventsTitle: 'No hay eventos programados',
    emptyNutritionTitle: 'Sin registro de comidas hoy',
    emptyProgressTitle: 'Sin datos todavía',
  },
  gamification: {
    streak: 'Racha',
    streakDays: 'días',
    currentStreak: 'Racha actual',
    longestStreak: 'Mejor racha',
    completedToday: 'Hoy completado',
    badges: 'Logros',
    unlocked: 'Desbloqueado',
    locked: 'Bloqueado',
    prs: 'Récords Personales',
    newPR: '¡Nuevo récord!',
    leaderboard: 'Leaderboard del Grupo',
    coachFeed: 'Feed del Coach',
    points: 'puntos',
    emptyLeaderboard: 'Sin datos de leaderboard',
    emptyCoachFeed: 'No hay publicaciones del coach',
  },
  screens: {
    // Reserved for per-screen copy; add keys as screens migrate off literals.
  },
} as const;

export type Texts = typeof texts;