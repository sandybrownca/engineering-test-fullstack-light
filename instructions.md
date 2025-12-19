## Technology Stack

**Backend:**
- Node.js 18 with Express
- TypeScript
- pg (PostgreSQL client with PostGIS support)
- sharp (server-side image processing)
- axios (fetching images from GCS)
- Jest (for unit testing) 

**Frontend:**
- React 18 with TypeScript
- Vite (fast build tool)
- React Router (client-side routing)
- Nginx (production serving)
- Vitest(unit testing)

**Database:**
- PostgreSQL 9.6 with PostGIS extensions(provided)


## Quick Start

### Prerequisites
- Docker and docker-compose installed
- Ports 3000, 5555, and 8080 available

### Run the Full Application

```bash
# Build and start all services (database, backend, frontend)
docker-compose -f docker-compose.app.yml up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5555
```

The first build will take a few minutes to download dependencies and build images.

### Stopping the Application

```bash
# Stop all services
docker-compose -f docker-compose.app.yml down

# Stop and remove volumes (clears database)
docker-compose -f docker-compose.app.yml down -v

## Troubleshooting

**Port already in use:**
```bash
# Change ports in docker-compose.app.yml
```

**Database connection issues:**
```bash
# Ensure PostgreSQL is fully started before backend
# Check logs: docker-compose -f docker-compose.app.yml logs postgres
```

**Frontend can't reach backend:**
```bash
# Verify VITE_API_URL in frontend/.env matches backend port
```

**Image overlays not showing:**
```bash
# Check backend logs for image processing errors
# Verify property has parcel_geo and building_geo data
```

## Testing the Application

1. **View all properties:** Visit http://localhost:3000
2. **Property details:** Click "View Details" on any property
3. **Enable overlays:** Check the overlay box and select colors
4. **Search by coordinates:** 
   - Navigate to "Search by Coordinates"
   - Try: lon=-80.0782213, lat=26.8849731, radius=1755000
   - Should return multiple properties
