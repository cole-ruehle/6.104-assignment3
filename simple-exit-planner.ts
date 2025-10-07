/**
 * Simple Dynamic Exit Planner - AI Augmented Version
 * 
 * Simplified version that matches the DayPlanner structure and functionality
 */

import { GeminiLLM } from './gemini-llm';

// Core data structures - simplified to match DayPlanner
export interface Location {
    latitude: number;
    longitude: number;
    elevation?: number;
    timestamp: Date;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface PlannedRoute {
    id: string;
    name: string;
    waypoints: Location[];
    totalDistance: number; // in miles
    estimatedDuration: number; // in hours
    difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
}

export interface ActiveHike {
    id: string;
    user: User;
    route: PlannedRoute;
    startTime: Date;
    currentLocation: Location;
    isActive: boolean;
}

export interface ExitPoint {
    id: string;
    name: string;
    location: Location;
    accessibility: 'easy' | 'moderate' | 'difficult';
    distanceFromCurrent: number; // in miles
}

export interface ExitStrategy {
    id: string;
    exitPoint: ExitPoint;
    estimatedArrivalTime: Date;
    confidenceScore: number; // 0-1
    reasoning: string;
}

export interface UserProfile {
    id: string;
    userId: string;
    averagePace: number; // mph
    maxDistance: number; // miles
    riskTolerance: 'conservative' | 'moderate' | 'adventurous';
    weatherSensitivity: 'low' | 'medium' | 'high';
}

export interface ContextualFactors {
    weather: {
        temperature: number;
        conditions: string;
        forecast: string;
    };
    trailConditions: {
        difficulty: string;
        surface: string;
        obstacles: string[];
    };
    userFatigue: {
        pace: number;
        energyLevel: number; // 1-10 scale
        perceivedExertion: number; // 1-10 scale
    };
}

export interface UserFeedback {
    hikeId: string;
    exitStrategyId: string;
    satisfaction: number; // 1-5
    accuracy: number; // 1-5
    helpfulness: number; // 1-5
    comments: string;
}

export interface CompletedHike {
    id: string;
    user: User;
    route: PlannedRoute;
    startTime: Date;
    endTime: Date;
    exitPoint: ExitPoint;
    totalDistance: number;
    actualDuration: number;
    userFeedback?: UserFeedback;
}

// Main Simple Dynamic Exit Planner class
export class SimpleDynamicExitPlanner {
    private activeHikes: Map<string, ActiveHike> = new Map();
    private exitPoints: Map<string, ExitPoint> = new Map();
    private userProfiles: Map<string, UserProfile> = new Map();
    private llm: GeminiLLM;

    constructor(llm: GeminiLLM) {
        this.llm = llm;
        this.initializeExitPoints();
    }

    // Core actions from the specification
    async startHike(route: PlannedRoute, user: User): Promise<ActiveHike> {
        if (this.activeHikes.has(user.id)) {
            throw new Error('User is already on an active hike');
        }

        const hike: ActiveHike = {
            id: `hike_${Date.now()}`,
            user,
            route,
            startTime: new Date(),
            currentLocation: route.waypoints[0],
            isActive: true
        };

        this.activeHikes.set(user.id, hike);
        
        console.log(`🏔️ Started hike: ${route.name} for ${user.name}`);
        console.log(`📍 Starting location: ${route.waypoints[0].latitude}, ${route.waypoints[0].longitude}`);
        
        return hike;
    }

    async updateLocation(hike: ActiveHike, newLocation: Location): Promise<ActiveHike> {
        if (!hike.isActive) {
            throw new Error('Hike is not active');
        }

        const updatedHike = {
            ...hike,
            currentLocation: newLocation,
            timestamp: new Date()
        };

        this.activeHikes.set(hike.user.id, updatedHike);
        
        console.log(`📍 Updated location: ${newLocation.latitude}, ${newLocation.longitude}`);
        
        return updatedHike;
    }

    async getExitStrategies(hike: ActiveHike): Promise<ExitStrategy[]> {
        if (!hike.isActive) {
            throw new Error('Hike is not active');
        }

        const userProfile = this.userProfiles.get(hike.user.id);
        if (!userProfile) {
            throw new Error('User profile not found');
        }

        const contextualFactors = this.getContextualFactors(hike);
        
        try {
            console.log('🤖 Requesting exit strategies from Gemini AI...');
            
            const prompt = this.createExitStrategyPrompt(hike, userProfile, contextualFactors);
            const text = await this.llm.executeLLM(prompt);
            
            console.log('✅ Received response from Gemini AI!');
            console.log('\n🤖 RAW GEMINI RESPONSE');
            console.log('======================');
            console.log(text);
            console.log('======================\n');
            
            // Parse and apply the strategies
            const strategies = this.parseExitStrategies(text, hike);
            
            console.log(`🎯 Generated ${strategies.length} exit strategies for ${hike.user.name}`);
            return strategies;
            
        } catch (error) {
            console.error('❌ Error calling Gemini API:', (error as Error).message);
            throw error;
        }
    }

    async endHike(hike: ActiveHike, exitPoint: ExitPoint): Promise<CompletedHike> {
        if (!hike.isActive) {
            throw new Error('Hike is not active');
        }

        const completedHike: CompletedHike = {
            id: hike.id,
            user: hike.user,
            route: hike.route,
            startTime: hike.startTime,
            endTime: new Date(),
            exitPoint,
            totalDistance: this.calculateDistance(hike),
            actualDuration: (Date.now() - hike.startTime.getTime()) / (1000 * 60 * 60)
        };

        this.activeHikes.delete(hike.user.id);
        
        console.log(`🏁 Completed hike: ${hike.route.name}`);
        console.log(`📍 Exit point: ${exitPoint.name}`);
        console.log(`⏱️ Duration: ${completedHike.actualDuration.toFixed(2)} hours`);
        
        return completedHike;
    }

    // AI-augmented actions
    async generatePersonalizedRecommendations(
        hike: ActiveHike,
        userProfile: UserProfile,
        contextualFactors: ContextualFactors
    ): Promise<ExitStrategy[]> {
        return await this.getExitStrategies(hike);
    }

    async analyzeUserState(hike: ActiveHike, sensorData: Map<string, any>): Promise<any> {
        const prompt = this.createUserStateAnalysisPrompt(hike, sensorData);
        
        try {
            const response = await this.llm.executeLLM(prompt);
            return this.parseUserState(response);
        } catch (error) {
            console.error('❌ Error analyzing user state:', (error as Error).message);
            throw error;
        }
    }

    async provideContextualGuidance(hike: ActiveHike, userQuery: string): Promise<string> {
        const prompt = this.createGuidancePrompt(hike, userQuery);
        
        try {
            const response = await this.llm.executeLLM(prompt);
            return response;
        } catch (error) {
            console.error('❌ Error providing contextual guidance:', (error as Error).message);
            throw error;
        }
    }

    async learnFromUserFeedback(hike: ActiveHike, feedback: UserFeedback): Promise<UserProfile> {
        const prompt = this.createLearningPrompt(hike, feedback);
        
        try {
            const response = await this.llm.executeLLM(prompt);
            const updatedProfile = this.parseUpdatedProfile(response);
            this.userProfiles.set(hike.user.id, updatedProfile);
            return updatedProfile;
        } catch (error) {
            console.error('❌ Error learning from feedback:', (error as Error).message);
            throw error;
        }
    }

    // Helper methods
    private initializeExitPoints(): void {
        // Initialize with some sample exit points
        const exitPoints: ExitPoint[] = [
            {
                id: 'exit1',
                name: 'Bear Brook Trail',
                location: { latitude: 44.1234, longitude: -71.5678, timestamp: new Date() },
                accessibility: 'easy',
                distanceFromCurrent: 1.2
            },
            {
                id: 'exit2',
                name: 'North Trailhead',
                location: { latitude: 44.1345, longitude: -71.5789, timestamp: new Date() },
                accessibility: 'moderate',
                distanceFromCurrent: 2.1
            },
            {
                id: 'exit3',
                name: 'Emergency Shelter',
                location: { latitude: 44.1456, longitude: -71.5890, timestamp: new Date() },
                accessibility: 'difficult',
                distanceFromCurrent: 0.8
            }
        ];

        exitPoints.forEach(exitPoint => {
            this.exitPoints.set(exitPoint.id, exitPoint);
        });
    }

    private getContextualFactors(hike: ActiveHike): ContextualFactors {
        return {
            weather: {
                temperature: 65,
                conditions: 'Partly cloudy',
                forecast: 'Light rain expected in 2 hours'
            },
            trailConditions: {
                difficulty: hike.route.difficulty,
                surface: 'dirt',
                obstacles: ['rocky sections', 'muddy patches']
            },
            userFatigue: {
                pace: 2.5,
                energyLevel: 7,
                perceivedExertion: 6
            }
        };
    }

    private createExitStrategyPrompt(
        hike: ActiveHike,
        userProfile: UserProfile,
        contextualFactors: ContextualFactors
    ): string {
        const availableExitPoints = Array.from(this.exitPoints.values())
            .map(exit => `- ${exit.name} (${exit.distanceFromCurrent} miles, ${exit.accessibility} access)`)
            .join('\n');

        return `
You are an AI hiking assistant providing personalized exit strategy recommendations.

HIKER PROFILE:
- Name: ${userProfile.userId}
- Average Pace: ${userProfile.averagePace} mph
- Max Distance: ${userProfile.maxDistance} miles
- Risk Tolerance: ${userProfile.riskTolerance}
- Weather Sensitivity: ${userProfile.weatherSensitivity}

CURRENT HIKE:
- Route: ${hike.route.name}
- Distance: ${hike.route.totalDistance} miles
- Difficulty: ${hike.route.difficulty}
- Elapsed Time: ${this.getElapsedTime(hike)} hours
- Current Location: ${hike.currentLocation.latitude}, ${hike.currentLocation.longitude}

CONTEXTUAL FACTORS:
- Weather: ${contextualFactors.weather.temperature}°F, ${contextualFactors.weather.conditions}
- Trail Conditions: ${contextualFactors.trailConditions.surface}, ${contextualFactors.trailConditions.difficulty}
- User Fatigue: Pace ${contextualFactors.userFatigue.pace} mph, Energy ${contextualFactors.userFatigue.energyLevel}/10

AVAILABLE EXIT POINTS:
${availableExitPoints}

PREFERENCES:
- Exercise activities work well in the morning (6:00 AM - 10:00 AM)
- Conservative hikers prefer easier, shorter exit routes
- Weather-sensitive hikers should prioritize sheltered exits
- Adventurous hikers can handle more challenging terrain
- Consider user's current energy level and pace

CRITICAL REQUIREMENTS:
1. ONLY recommend from the exit points listed above
2. Consider the hiker's current energy level and pace
3. Factor in weather conditions and trail difficulty
4. Provide confidence scores between 0 and 1
5. Give detailed reasoning for each recommendation

CRITICAL: You MUST return ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or additional content.

Return your response as a JSON object with this exact structure:
{
  "strategies": [
    {
      "exitPointName": "exact exit point name from the list above",
      "confidence": 0.85,
      "reasoning": "Based on your current pace and weather conditions...",
      "estimatedArrivalTime": "2:30 PM"
    }
  ]
}

IMPORTANT: Start your response with { and end with }. Include no other text.`;
    }

    private createUserStateAnalysisPrompt(hike: ActiveHike, sensorData: Map<string, any>): string {
        const sensorInfo = Array.from(sensorData.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        return `
Analyze the hiker's current physical and mental state based on sensor data and hiking context.

HIKE CONTEXT:
- Route: ${hike.route.name}
- Elapsed Time: ${this.getElapsedTime(hike)} hours
- Current Location: ${hike.currentLocation.latitude}, ${hike.currentLocation.longitude}

SENSOR DATA:
${sensorInfo}

CRITICAL: You MUST return ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or additional content.

Provide a comprehensive user state analysis.
Return as JSON:
{
  "physicalState": {
    "fatigue": 6,
    "energy": 5,
    "pace": 2.2
  },
  "mentalState": {
    "confidence": 7,
    "stress": 4,
    "motivation": 8
  },
  "recommendations": [
    "Consider taking a break",
    "Monitor energy levels closely"
  ]
}

IMPORTANT: Start your response with { and end with }. Include no other text.`;
    }

    private createGuidancePrompt(hike: ActiveHike, userQuery: string): string {
        return `
You are an AI hiking assistant providing personalized, contextual advice.

HIKE CONTEXT:
- Route: ${hike.route.name}
- Elapsed Time: ${this.getElapsedTime(hike)} hours
- Current Location: ${hike.currentLocation.latitude}, ${hike.currentLocation.longitude}

USER QUESTION: "${userQuery}"

Provide helpful, personalized advice considering the hiker's current situation, safety, and available options.
Be encouraging but realistic about capabilities and conditions.`;
    }

    private createLearningPrompt(hike: ActiveHike, feedback: UserFeedback): string {
        return `
Update the user profile based on hiking feedback and experience.

ORIGINAL PROFILE:
${JSON.stringify(this.userProfiles.get(hike.user.id), null, 2)}

FEEDBACK:
- Satisfaction: ${feedback.satisfaction}/5
- Accuracy: ${feedback.accuracy}/5
- Helpfulness: ${feedback.helpfulness}/5
- Comments: ${feedback.comments}

Update the user profile to reflect learned preferences and capabilities.
Return as JSON with updated profile data.`;
    }

    private parseExitStrategies(responseText: string, hike: ActiveHike): ExitStrategy[] {
        try {
            console.log('🔍 Parsing LLM response...');
            console.log('Raw response:', responseText);
            
            // Try to find JSON in the response
            let jsonText = responseText.trim();
            
            // If response doesn't start with {, try to find JSON within
            if (!jsonText.startsWith('{')) {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonText = jsonMatch[0];
                } else {
                    throw new Error('No JSON found in response');
                }
            }

            const response = JSON.parse(jsonText);
            
            if (!response.strategies || !Array.isArray(response.strategies)) {
                throw new Error('Invalid response format');
            }

            console.log('📝 Applying LLM exit strategies...');

            const strategies: ExitStrategy[] = [];
            const issues: string[] = [];
            const validatedStrategies: { strategy: ExitStrategy; confidence: number }[] = [];

            for (const rawStrategy of response.strategies) {
                if (typeof rawStrategy !== 'object' || rawStrategy === null) {
                    issues.push('Encountered a strategy entry that is not an object.');
                    continue;
                }

                const { exitPointName, confidence, reasoning, estimatedArrivalTime } = rawStrategy as { 
                    exitPointName?: unknown; 
                    confidence?: unknown; 
                    reasoning?: unknown;
                    estimatedArrivalTime?: unknown;
                };

                if (typeof exitPointName !== 'string' || exitPointName.trim().length === 0) {
                    issues.push('Strategy is missing a valid exit point name.');
                    continue;
                }

                const exitPoint = Array.from(this.exitPoints.values())
                    .find(ep => ep.name === exitPointName);
                
                if (!exitPoint) {
                    issues.push(`Exit point "${exitPointName}" not found.`);
                    continue;
                }

                if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
                    issues.push(`Strategy for "${exitPointName}" has invalid confidence score.`);
                    continue;
                }

                if (typeof reasoning !== 'string' || reasoning.trim().length === 0) {
                    issues.push(`Strategy for "${exitPointName}" is missing reasoning.`);
                    continue;
                }

                // VALIDATOR 1: Check for logical inconsistencies in reasoning
                const reasoningIssues = this.validateReasoning(reasoning, exitPoint, hike);
                if (reasoningIssues.length > 0) {
                    issues.push(`Strategy for "${exitPointName}" has logical issues: ${reasoningIssues.join(', ')}`);
                    continue;
                }

                // VALIDATOR 2: Check for unrealistic confidence scores
                if (confidence > 0.95) {
                    issues.push(`Strategy for "${exitPointName}" has unrealistic confidence score (${confidence}). Consider lowering to 0.9 or below.`);
                }

                // VALIDATOR 3: Check for duplicate exit points
                const duplicateStrategy = validatedStrategies.find(s => s.strategy.exitPoint.id === exitPoint.id);
                if (duplicateStrategy) {
                    issues.push(`Duplicate exit point "${exitPointName}" in strategies.`);
                    continue;
                }

                const strategy: ExitStrategy = {
                    id: `strategy_${Date.now()}_${Math.random()}`,
                    exitPoint,
                    estimatedArrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                    confidenceScore: confidence,
                    reasoning: reasoning
                };

                validatedStrategies.push({ strategy, confidence });
                strategies.push(strategy);
                console.log(`✅ Generated strategy for "${exitPoint.name}" (confidence: ${(confidence * 100).toFixed(1)}%)`);
            }

            // VALIDATOR 4: Check for minimum number of strategies
            if (strategies.length === 0) {
                throw new Error('LLM provided no valid exit strategies');
            }

            // VALIDATOR 5: Check for reasonable confidence distribution
            const avgConfidence = strategies.reduce((sum, s) => sum + s.confidenceScore, 0) / strategies.length;
            if (avgConfidence < 0.3) {
                issues.push(`Average confidence score (${avgConfidence.toFixed(2)}) is suspiciously low.`);
            }

            if (issues.length > 0) {
                console.warn(`⚠️  LLM provided some invalid strategies:\n- ${issues.join('\n- ')}`);
            }

            return strategies;
            
        } catch (error) {
            console.error('❌ Error parsing LLM response:', (error as Error).message);
            console.log('Response was:', responseText);
            throw error;
        }
    }

    // VALIDATOR: Check reasoning for logical inconsistencies
    private validateReasoning(reasoning: string, exitPoint: ExitPoint, hike: ActiveHike): string[] {
        const issues: string[] = [];
        const reasoningLower = reasoning.toLowerCase();

        // Check for contradictory statements
        if (reasoningLower.includes('easy') && exitPoint.accessibility === 'difficult') {
            issues.push('reasoning claims "easy" but exit point is marked as difficult');
        }

        if (reasoningLower.includes('difficult') && exitPoint.accessibility === 'easy') {
            issues.push('reasoning claims "difficult" but exit point is marked as easy');
        }

        // Check for distance inconsistencies
        if (reasoningLower.includes('close') && exitPoint.distanceFromCurrent > 2) {
            issues.push('reasoning claims "close" but exit point is over 2 miles away');
        }

        if (reasoningLower.includes('far') && exitPoint.distanceFromCurrent < 1) {
            issues.push('reasoning claims "far" but exit point is under 1 mile away');
        }

        // Check for weather-related inconsistencies
        if (reasoningLower.includes('good weather') && hike.route.difficulty === 'expert') {
            issues.push('reasoning mentions "good weather" for expert-level trail');
        }

        // Check for user capability mismatches
        if (reasoningLower.includes('beginner') && hike.route.difficulty === 'expert') {
            issues.push('reasoning mentions "beginner" for expert-level trail');
        }

        return issues;
    }

    private parseUserState(response: string): any {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Error parsing user state:', error);
            return {
                physicalState: { fatigue: 5, energy: 6, pace: 2.5 },
                mentalState: { confidence: 7, stress: 3, motivation: 8 },
                recommendations: ['Continue monitoring your condition']
            };
        }
    }

    private parseUpdatedProfile(response: string): UserProfile {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Error parsing updated profile:', error);
            throw error;
        }
    }

    private getElapsedTime(hike: ActiveHike): number {
        return (Date.now() - hike.startTime.getTime()) / (1000 * 60 * 60);
    }

    private calculateDistance(hike: ActiveHike): number {
        // Simple implementation - return route distance
        return hike.route.totalDistance;
    }

    // Utility methods for testing and display
    getActiveHikes(): ActiveHike[] {
        return Array.from(this.activeHikes.values());
    }

    getExitPoints(): ExitPoint[] {
        return Array.from(this.exitPoints.values());
    }

    getUserProfiles(): UserProfile[] {
        return Array.from(this.userProfiles.values());
    }

    addUserProfile(profile: UserProfile): void {
        this.userProfiles.set(profile.userId, profile);
    }

    addExitPoint(exitPoint: ExitPoint): void {
        this.exitPoints.set(exitPoint.id, exitPoint);
    }

    // Display methods similar to DayPlanner
    displayActiveHikes(): void {
        console.log('\n🏔️ Active Hikes');
        console.log('================');
        
        const activeHikes = this.getActiveHikes();
        if (activeHikes.length === 0) {
            console.log('No active hikes.');
        } else {
            activeHikes.forEach((hike, index) => {
                const elapsed = this.getElapsedTime(hike);
                console.log(`${index + 1}. ${hike.route.name} - ${hike.user.name}`);
                console.log(`   Duration: ${elapsed.toFixed(2)} hours`);
                console.log(`   Location: ${hike.currentLocation.latitude}, ${hike.currentLocation.longitude}`);
            });
        }
    }

    displayExitPoints(): void {
        console.log('\n🚪 Available Exit Points');
        console.log('=========================');
        
        const exitPoints = this.getExitPoints();
        exitPoints.forEach((exitPoint, index) => {
            console.log(`${index + 1}. ${exitPoint.name}`);
            console.log(`   Distance: ${exitPoint.distanceFromCurrent} miles`);
            console.log(`   Accessibility: ${exitPoint.accessibility}`);
            console.log(`   Location: ${exitPoint.location.latitude}, ${exitPoint.location.longitude}`);
        });
    }
}
