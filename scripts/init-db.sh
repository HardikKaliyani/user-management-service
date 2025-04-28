#!/bin/bash

# Database initialization script for user-management-service

echo "Starting database initialization..."

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed the database with initial data
echo "Seeding the database..."
npx prisma db seed

echo "Database initialization completed successfully."