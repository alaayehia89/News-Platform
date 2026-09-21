$body = @{
    full_name = "Alaa Yehia"
    email = "alaa@example.com"
    password = "SecurePassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"