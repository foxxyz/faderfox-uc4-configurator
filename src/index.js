import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './app.vue'
import HomePage from './pages/home.vue'

import { ControllerManager } from '@/services/controllers/manager.js'

// Set up app
const app = createApp(App)

// Set up controllers
const controllers = new ControllerManager()
app.provide('$controllers', controllers)
controllers.init()

// Set up router
const routes = [
    { path: '/', component: HomePage },
    { path: '/:catchAll(.*)', redirect: '/' },
]
const router = createRouter({ routes, history: createWebHistory() })
app.use(router)

app.mount('body')
