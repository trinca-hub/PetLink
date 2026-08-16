namespace PetLink_BackEnd.Objects.Contracts;

public static class ApiResponseFactory
{
    public static ApiResponse<T> Success<T>(string message, T data)
    {
        return new ApiResponse<T>
        {
            Message = message,
            Data = data,
            Error = null
        };
    }

    public static ApiResponse<T> Failure<T>(string message, string? error = null)
    {
        return new ApiResponse<T>
        {
            Message = message,
            Data = default,
            Error = error
        };
    }
}
