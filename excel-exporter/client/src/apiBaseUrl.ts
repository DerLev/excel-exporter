const apiBaseUrl =
  import.meta.env.MODE === "development" ? "http://localhost:8099/api" : "api"

export default apiBaseUrl
