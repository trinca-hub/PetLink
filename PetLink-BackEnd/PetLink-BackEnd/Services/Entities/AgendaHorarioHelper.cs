namespace PetLink_BackEnd.Services.Entities
{
    internal static class AgendaHorarioHelper
    {
        public static readonly TimeSpan InicioManha = new(8, 0, 0);
        public static readonly TimeSpan FimManha = new(11, 0, 0);
        public static readonly TimeSpan InicioTarde = new(13, 0, 0);
        public static readonly TimeSpan FimTarde = new(17, 0, 0);

        private static readonly TimeZoneInfo FusoHorario = CarregarFusoHorario();

        public static DateTime HojeLocal =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, FusoHorario).Date;

        public static DateTime ObterDataLocal(DateTime? dataHora)
        {
            if (!dataHora.HasValue)
                return HojeLocal;

            if (dataHora.Value.Kind == DateTimeKind.Unspecified)
                return dataHora.Value.Date;

            return TimeZoneInfo.ConvertTimeFromUtc(ParaUtc(dataHora.Value), FusoHorario).Date;
        }

        public static DateTime CriarHorarioUtc(DateTime dataLocal, TimeSpan horarioLocal)
        {
            var local = DateTime.SpecifyKind(dataLocal.Date.Add(horarioLocal), DateTimeKind.Unspecified);
            return TimeZoneInfo.ConvertTimeToUtc(local, FusoHorario);
        }

        public static DateTime ParaUtc(DateTime dataHora)
        {
            var utc = dataHora.Kind switch
            {
                DateTimeKind.Utc => dataHora,
                DateTimeKind.Local => dataHora.ToUniversalTime(),
                _ => TimeZoneInfo.ConvertTimeToUtc(
                    DateTime.SpecifyKind(dataHora, DateTimeKind.Unspecified),
                    FusoHorario)
            };

            return new DateTime(utc.Year, utc.Month, utc.Day, utc.Hour, utc.Minute, 0, DateTimeKind.Utc);
        }

        public static bool EstaDentroDoHorario(DateTime dataHoraInicio, int duracaoMinutos)
        {
            var inicioUtc = ParaUtc(dataHoraInicio);
            var inicioLocal = TimeZoneInfo.ConvertTimeFromUtc(inicioUtc, FusoHorario).TimeOfDay;
            var fimLocal = inicioLocal.Add(TimeSpan.FromMinutes(duracaoMinutos));

            var periodoManha = inicioLocal >= InicioManha && fimLocal <= FimManha;
            var periodoTarde = inicioLocal >= InicioTarde && fimLocal <= FimTarde;
            return periodoManha || periodoTarde;
        }

        private static TimeZoneInfo CarregarFusoHorario()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
            }
        }
    }
}
