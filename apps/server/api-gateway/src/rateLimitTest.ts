for ($i = 1; $i -le 250; $i++) {
  $response = Invoke-WebRequest -Uri "http://localhost:4000/v1/trpc/payments.plaid.getConnectedBanks?input=%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%2C%22v%22%3A1%7D%7D " -Method GET -SkipHttpErrorCheck
  Write-Host "Request $i : $($response.StatusCode)"
}


for ($i = 1; $i -le 250; $i++) {
  $response = Invoke-WebRequest -Uri "http://localhost:4000/v1/trpc/payments.plaid.getConnectedBanks" -Method GET -SkipHttpErrorCheck
  Write-Host "Request $i : $($response.StatusCode)"
}