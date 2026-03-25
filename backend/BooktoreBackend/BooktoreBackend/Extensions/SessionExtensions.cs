using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace BooktoreBackend.Extensions;

public static class SessionExtensions
{
    public static void SetAsJson<T>(this ISession session, string key, T value)
    {
        var json = JsonSerializer.Serialize(value);
        session.SetString(key, json);
    }

    public static T? GetFromJson<T>(this ISession session, string key)
    {
        var json = session.GetString(key);
        return json is null ? default : JsonSerializer.Deserialize<T>(json);
    }
}
