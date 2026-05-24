// Initialize MongoDB replica set for local development
// This runs automatically on first container start

try {
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "mongodb:27017" }],
  });
  print("Replica set initiated successfully");
} catch (e) {
  print("Replica set already initiated or error: " + e.message);
}
