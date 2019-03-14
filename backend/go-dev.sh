#!/bin/bash
sudo systemctl start postgresql.service
postgrest ./postgrest.dev.conf & nginx -p . -c ./nginx.dev.example.conf
