'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'

const STEPS_KEY = 'hamraz_steps'
const SYNC_INTERVAL = 60_000
const STEP_THRESHOLD = 12
const MIN_STEP_INTERVAL = 200
const ACC_WINDOW = 10

function loadStoredSteps(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(STEPS_KEY)
  return stored ? parseInt(stored, 10) : 0
}

export function usePhoneSensors() {
  const [steps, setSteps] = useState(0)
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [active, setActive] = useState(false)
  const accelRef = useRef<number[]>([])
  const lastStepRef = useRef(0)
  const lastSyncRef = useRef(0)
  const baselineRef = useRef(loadStoredSteps())
  const accRef = useRef({ x: 0, y: 0, z: 0 })

  const syncSteps = useCallback(async (total: number) => {
    const now = Date.now()
    if (now - lastSyncRef.current < SYNC_INTERVAL) return
    lastSyncRef.current = now
    try {
      await api.devices.recordSensor({
        sensorType: 'STEP_COUNTER',
        value: total,
        unit: 'steps',
        metadata: { syncedAt: new Date().toISOString() },
      })
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    const stored = loadStoredSteps()
    setSteps(stored)
    baselineRef.current = stored
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!(window as any).DeviceMotionEvent) {
      setPermission('denied')
      return
    }

    const checkPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const result = await (DeviceMotionEvent as any).requestPermission()
          setPermission(result)
          if (result === 'granted') setActive(true)
        } catch {
          setPermission('prompt')
        }
      } else {
        setPermission('granted')
        setActive(true)
      }
    }

    checkPermission()
  }, [])

  useEffect(() => {
    if (!active) return

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.acceleration ?? { x: 0, y: 0, z: 0 }
      if (x == null || y == null || z == null) return

      accRef.current = { x, y, z }
      const magnitude = Math.sqrt(x * x + y * y + z * z)
      const window = accelRef.current
      window.push(magnitude)
      if (window.length > ACC_WINDOW) window.shift()

      if (window.length < ACC_WINDOW) return
      const avg = window.reduce((a, b) => a + b, 0) / window.length
      const now = Date.now()

      if (magnitude > avg + STEP_THRESHOLD && now - lastStepRef.current > MIN_STEP_INTERVAL) {
        lastStepRef.current = now
        baselineRef.current += 1
        const total = baselineRef.current
        setSteps(total)
        localStorage.setItem(STEPS_KEY, String(total))
        syncSteps(total)
      }
    }

    window.addEventListener('devicemotion', handleMotion, { passive: true })
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [active, syncSteps])

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission()
        setPermission(result)
        if (result === 'granted') setActive(true)
      } catch {
        // silent
      }
    } else {
      setPermission('granted')
      setActive(true)
    }
  }, [])

  const resetSteps = useCallback(() => {
    baselineRef.current = 0
    setSteps(0)
    localStorage.removeItem(STEPS_KEY)
  }, [])

  return { steps, permission, active, requestPermission, resetSteps }
}
