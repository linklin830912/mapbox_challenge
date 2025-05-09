import axios from 'axios';
import { SERVER_ROOT } from '../const/API_CONSTANT';

export const api = axios.create({
  baseURL: SERVER_ROOT, // replace with your actual backend URL
  headers: {
    'Content-Type': 'application/json',
  }
});

