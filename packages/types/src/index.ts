import { z } from 'zod'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum VitalMetricType {
  HEART_RATE = 'HEART_RATE',
  BLOOD_PRESSURE_SYSTOLIC = 'BLOOD_PRESSURE_SYSTOLIC',
  BLOOD_PRESSURE_DIASTOLIC = 'BLOOD_PRESSURE_DIASTOLIC',
  TEMPERATURE = 'TEMPERATURE',
  SPO2 = 'SPO2',
  WEIGHT = 'WEIGHT',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  HRV = 'HRV',
  RESPIRATORY_RATE = 'RESPIRATORY_RATE',
  STEPS = 'STEPS',
  CALORIES_BURNED = 'CALORIES_BURNED',
  SLEEP_HOURS = 'SLEEP_HOURS',
  SLEEP_QUALITY = 'SLEEP_QUALITY',
  STRESS_LEVEL = 'STRESS_LEVEL',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum DeviceType {
  GOOGLE_HEALTH_CONNECT = 'GOOGLE_HEALTH_CONNECT',
  APPLE_HEALTH_KIT = 'APPLE_HEALTH_KIT',
  FITBIT = 'FITBIT',
  GARMIN = 'GARMIN',
  SAMSUNG_HEALTH = 'SAMSUNG_HEALTH',
  HUAWEI_HEALTH = 'HUAWEI_HEALTH',
  MANUAL = 'MANUAL',
}

export enum SensorType {
  ACCELEROMETER = 'ACCELEROMETER',
  GYROSCOPE = 'GYROSCOPE',
  STEP_COUNTER = 'STEP_COUNTER',
  GPS = 'GPS',
  ACTIVITY_RECOGNITION = 'ACTIVITY_RECOGNITION',
  SLEEP = 'SLEEP',
  SCREEN_ACTIVITY = 'SCREEN_ACTIVITY',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export enum AnomalySeverity {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum InsightType {
  DAILY_SUMMARY = 'DAILY_SUMMARY',
  WEEKLY_TREND = 'WEEKLY_TREND',
  MONTHLY_REPORT = 'MONTHLY_REPORT',
  ANOMALY_ALERT = 'ANOMALY_ALERT',
  WELLNESS_TIP = 'WELLNESS_TIP',
  MILESTONE = 'MILESTONE',
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string | null
  gender?: Gender | null
  dateOfBirth?: Date | null
  height?: number | null
  weight?: number | null
  avatar?: string | null
  onboardingCompleted: boolean
  isActive: boolean
  timezone?: string | null
  measurementSystem: string
  createdAt: Date
  updatedAt: Date
}

export interface VitalRecord {
  id: string
  userId: string
  metric: VitalMetricType
  value: number
  unit: string
  timestamp: Date
  source?: DeviceType | null
  recordedAt: Date
}

export interface VitalBaseline {
  id: string
  userId: string
  metric: VitalMetricType
  minValue: number
  maxValue: number
  mean?: number | null
  stdDev?: number | null
  percentile5?: number | null
  percentile95?: number | null
  targetValue?: number | null
  unit: string
  sampleCount: number
  updatedAt: Date
}

export interface EmergencyContact {
  id: string
  userId: string
  name: string
  phone: string
  relationship: string
  isNotified: boolean
  createdAt: Date
}

export interface EmergencyAlert {
  id: string
  userId: string
  type: string
  severity?: AnomalySeverity | null
  location?: string | null
  status: string
  contactedAt?: Date | null
  resolvedAt?: Date | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface NotificationPreference {
  id: string
  userId: string
  email: boolean
  push: boolean
  sms: boolean
  types: string[]
  insights: boolean
  anomalies: boolean
  summaries: boolean
}

export interface Conversation {
  id: string
  userId: string
  title?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  metadata?: Record<string, unknown> | null
  createdAt: Date
}

export interface HealthMetrics {
  id: string
  userId: string
  date: Date
  steps?: number | null
  calories?: number | null
  sleepHours?: number | null
  sleepQuality?: number | null
  waterIntake?: number | null
  mood?: number | null
  createdAt: Date
}

export interface Analytics {
  id: string
  userId: string
  period: string
  metric: string
  average: number
  min: number
  max: number
  trend: number
  createdAt: Date
}

export interface SyncLog {
  id: string
  userId: string
  device: string
  status: string
  syncedAt: Date
}

export interface AuditLog {
  id: string
  userId?: string | null
  action: string
  resource: string
  details?: string | null
  ipAddress?: string | null
  createdAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  theme: string
  measurementSystem: string
  aiProvider: string
  wearableAutoSync: boolean
  dataCollectionEnabled: boolean
  insightFrequency: string
  privacyJson?: Record<string, unknown> | null
}

export interface WearableDevice {
  id: string
  userId: string
  deviceType: DeviceType
  deviceName: string
  externalId: string
  isConnected: boolean
  lastSyncAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface WearableSyncLog {
  id: string
  deviceId: string
  userId: string
  status: SyncStatus
  startedAt: Date
  completedAt?: Date | null
  metricsSynced: string[]
  recordsCount: number
  errorMessage?: string | null
  rawDataSize?: number | null
}

export interface PhoneSensorData {
  id: string
  userId: string
  sensorType: SensorType
  value: number
  unit: string
  timestamp: Date
  metadata?: Record<string, unknown> | null
}

export interface AnomalyDetection {
  id: string
  userId: string
  metric: VitalMetricType
  value: number
  baselineMin?: number | null
  baselineMax?: number | null
  baselineMean?: number | null
  zScore?: number | null
  severity: AnomalySeverity
  explanation?: string | null
  isReviewed: boolean
  reviewedAt?: Date | null
  detectedAt: Date
}

export interface AIInsight {
  id: string
  userId: string
  insightType: InsightType
  title: string
  summary: string
  content?: Record<string, unknown> | null
  riskScore?: number | null
  isRead: boolean
  isDismissed: boolean
  createdAt: Date
}

export interface DailySummary {
  id: string
  userId: string
  date: Date
  summary: string
  keyMetrics?: Record<string, unknown> | null
  highlights: string[]
  recommendations: string[]
  mood?: number | null
  energy?: number | null
  createdAt: Date
}

export interface AuthRequest {
  email: string
  password: string
  name?: string
}

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const vitalCreateSchema = z.object({
  userId: z.string().uuid(),
  metric: z.nativeEnum(VitalMetricType),
  value: z.number().positive(),
  unit: z.string().min(1),
  timestamp: z.string().datetime().optional(),
  source: z.nativeEnum(DeviceType).optional(),
})

export const wearableConnectSchema = z.object({
  deviceType: z.nativeEnum(DeviceType),
  deviceName: z.string().min(1),
  externalId: z.string().min(1),
  authToken: z.string().optional(),
  refreshToken: z.string().optional(),
})

export const sensorDataSchema = z.object({
  sensorType: z.nativeEnum(SensorType),
  value: z.number(),
  unit: z.string().min(1),
  timestamp: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const anomalyReviewSchema = z.object({
  isReviewed: z.literal(true),
})

export const insightDismissSchema = z.object({
  isDismissed: z.literal(true),
})

export const userSettingsUpdateSchema = z.object({
  theme: z.string().optional(),
  measurementSystem: z.string().optional(),
  aiProvider: z.string().optional(),
  wearableAutoSync: z.boolean().optional(),
  dataCollectionEnabled: z.boolean().optional(),
  insightFrequency: z.string().optional(),
  privacyJson: z.record(z.unknown()).optional(),
})

export const emergencyContactSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().min(7),
  relationship: z.string().min(1),
})

export const sosTriggerSchema = z.object({
  userId: z.string().uuid(),
  type: z.string().default('MANUAL'),
  location: z.string().optional(),
})
