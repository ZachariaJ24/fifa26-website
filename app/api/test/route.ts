export async function GET() {
  return Response.json({
    message: "FIFA 26 League API Test",
    status: "working",
    timestamp: new Date().toISOString()
  })
}
