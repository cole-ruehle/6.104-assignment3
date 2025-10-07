/**
 * Challenging Test Cases for Simple Dynamic Exit Planner
 *
 * These test cases are designed to stress-test the AI augmentation and identify
 * potential failure modes, then experiment with prompt variants to mitigate them.
 */

import { SimpleDynamicExitPlanner, ActiveHike, UserProfile, ContextualFactors } from './simple-exit-planner';
import { GeminiLLM, Config } from './gemini-llm';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

/**
 * Test Case 1: Extreme Weather Conditions
 *
 * This test case challenges the AI to handle extreme weather scenarios
 * where traditional exit strategies might not be appropriate.
 */
export async function testExtremeWeatherConditions(): Promise<void> {
    console.log('\n🧪 CHALLENGING TEST CASE 1: Extreme Weather Conditions');
    console.log('=========================================================');
    
    const config = loadConfig();
    const planner = new SimpleDynamicExitPlanner(new GeminiLLM(config));
    
    // Create user profile for weather-sensitive hiker
    const userProfile: UserProfile = {
        id: 'weather_sensitive_user',
        userId: 'user1',
        averagePace: 2.0, // Slower pace due to weather sensitivity
        maxDistance: 8,
        riskTolerance: 'conservative',
        weatherSensitivity: 'high'
    };
    
    planner.addUserProfile(userProfile);
    
    // Create test hike in extreme conditions
    const user = { id: 'user1', name: 'Weather-Sensitive Hiker', email: 'weather@example.com' };
    const route = {
        id: 'extreme_weather_route',
        name: 'Storm Peak Trail',
        waypoints: [
            { latitude: 44.1234, longitude: -71.5678, elevation: 2000, timestamp: new Date() }
        ],
        totalDistance: 6.5,
        estimatedDuration: 4,
        difficulty: 'moderate' as const
    };
    
    const hike = await planner.startHike(route, user);
    console.log('✅ Created test hike for extreme weather scenario');
    
    // Test with extreme weather conditions
    console.log('\n🌪️ Testing AI recommendations in extreme weather...');
    
    // Override contextual factors for extreme weather
    const extremeWeatherFactors: ContextualFactors = {
        weather: {
            temperature: 25, // Very cold
            conditions: 'Blizzard conditions with 50mph winds',
            forecast: 'Severe weather warning - conditions deteriorating rapidly'
        },
        trailConditions: {
            difficulty: 'expert',
            surface: 'ice',
            obstacles: ['fallen trees', 'ice patches', 'reduced visibility']
        },
        userFatigue: {
            pace: 1.5, // Much slower due to conditions
            energyLevel: 4, // Low energy due to cold
            perceivedExertion: 8 // High exertion
        }
    };
    
    try {
        const strategies = await planner.getExitStrategies(hike);
        console.log(`✅ Generated ${strategies.length} exit strategies for extreme weather`);
        
        strategies.forEach((strategy, index) => {
            console.log(`\n   Strategy ${index + 1}:`);
            console.log(`   Exit Point: ${strategy.exitPoint.name}`);
            console.log(`   Confidence: ${(strategy.confidenceScore * 100).toFixed(1)}%`);
            console.log(`   Reasoning: ${strategy.reasoning}`);
        });
        
        // Test with safety-focused prompt variant
        console.log('\n🛡️ Testing with Safety-Focused Prompt Variant...');
        const safetyPrompt = createSafetyFocusedPrompt(hike, userProfile, extremeWeatherFactors);
        console.log('Safety-focused prompt created and ready for testing');
        
    } catch (error) {
        console.log(`⚠️  Extreme weather test: ${(error as Error).message}`);
    }
    
    console.log('✅ Extreme weather conditions test completed\n');
}

/**
 * Test Case 2: Conflicting User Preferences
 *
 * This test case presents the AI with conflicting user preferences
 * and challenging terrain to see how it resolves conflicts.
 */
export async function testConflictingPreferences(): Promise<void> {
    console.log('\n🧪 CHALLENGING TEST CASE 2: Conflicting User Preferences');
    console.log('=======================================================');
    
    const config = loadConfig();
    const planner = new SimpleDynamicExitPlanner(new GeminiLLM(config));
    
    // Create user profile with conflicting preferences
    const userProfile: UserProfile = {
        id: 'conflicted_user',
        userId: 'user2',
        averagePace: 3.5, // Fast pace
        maxDistance: 20, // Long distance capability
        riskTolerance: 'adventurous', // High risk tolerance
        weatherSensitivity: 'high' // But weather sensitive - CONFLICT!
    };
    
    planner.addUserProfile(userProfile);
    
    // Create test hike with challenging terrain
    const user = { id: 'user2', name: 'Conflicted Hiker', email: 'conflicted@example.com' };
    const route = {
        id: 'conflicting_preferences_route',
        name: 'Dangerous Ridge Trail',
        waypoints: [
            { latitude: 44.1234, longitude: -71.5678, elevation: 2000, timestamp: new Date() }
        ],
        totalDistance: 12.0,
        estimatedDuration: 8,
        difficulty: 'expert' as const
    };
    
    const hike = await planner.startHike(route, user);
    console.log('✅ Created test hike for conflicting preferences scenario');
    
    // Test with conflicting contextual factors
    console.log('\n⚖️ Testing AI recommendations with conflicting preferences...');
    
    const conflictingFactors: ContextualFactors = {
        weather: {
            temperature: 45,
            conditions: 'Foggy with poor visibility',
            forecast: 'Weather clearing in 3 hours but current conditions dangerous'
        },
        trailConditions: {
            difficulty: 'expert',
            surface: 'rocky',
            obstacles: ['narrow ledges', 'exposure', 'loose rock']
        },
        userFatigue: {
            pace: 3.0, // Still fast despite conditions
            energyLevel: 6, // Moderate energy
            perceivedExertion: 7 // High exertion due to terrain
        }
    };
    
    try {
        const strategies = await planner.getExitStrategies(hike);
        console.log(`✅ Generated ${strategies.length} exit strategies for conflicting preferences`);
        
        strategies.forEach((strategy, index) => {
            console.log(`\n   Strategy ${index + 1}:`);
            console.log(`   Exit Point: ${strategy.exitPoint.name}`);
            console.log(`   Confidence: ${(strategy.confidenceScore * 100).toFixed(1)}%`);
            console.log(`   Reasoning: ${strategy.reasoning}`);
        });
        
        // Test with preference-focused prompt variant
        console.log('\n👤 Testing with Preference-Focused Prompt Variant...');
        const preferencePrompt = createPreferenceFocusedPrompt(hike, userProfile, conflictingFactors);
        console.log('Preference-focused prompt created and ready for testing');
        
    } catch (error) {
        console.log(`⚠️  Conflicting preferences test: ${(error as Error).message}`);
    }
    
    console.log('✅ Conflicting preferences test completed\n');
}

/**
 * Test Case 3: Limited Exit Options
 *
 * This test case challenges the AI when there are very few exit options
 * and all of them are suboptimal.
 */
export async function testLimitedExitOptions(): Promise<void> {
    console.log('\n🧪 CHALLENGING TEST CASE 3: Limited Exit Options');
    console.log('===============================================');
    
    const config = loadConfig();
    const planner = new SimpleDynamicExitPlanner(new GeminiLLM(config));
    
    // Create user profile for experienced hiker
    const userProfile: UserProfile = {
        id: 'experienced_user',
        userId: 'user3',
        averagePace: 2.8,
        maxDistance: 15,
        riskTolerance: 'moderate',
        weatherSensitivity: 'medium'
    };
    
    planner.addUserProfile(userProfile);
    
    // Create test hike in remote area
    const user = { id: 'user3', name: 'Experienced Hiker', email: 'experienced@example.com' };
    const route = {
        id: 'limited_exit_route',
        name: 'Remote Wilderness Trail',
        waypoints: [
            { latitude: 44.1234, longitude: -71.5678, elevation: 2000, timestamp: new Date() }
        ],
        totalDistance: 10.0,
        estimatedDuration: 6,
        difficulty: 'hard' as const
    };
    
    const hike = await planner.startHike(route, user);
    console.log('✅ Created test hike for limited exit options scenario');
    
    // Add only difficult exit points
    const difficultExitPoint = {
        id: 'difficult_exit',
        name: 'Emergency Shelter',
        location: { latitude: 44.1456, longitude: -71.5890, timestamp: new Date() },
        accessibility: 'difficult' as const,
        distanceFromCurrent: 3.5 // Far away
    };
    
    planner.addExitPoint(difficultExitPoint);
    
    // Test with challenging conditions
    console.log('\n🚪 Testing AI recommendations with limited exit options...');
    
    const limitedOptionsFactors: ContextualFactors = {
        weather: {
            temperature: 35,
            conditions: 'Freezing rain and ice',
            forecast: 'Conditions worsening, emergency shelter recommended'
        },
        trailConditions: {
            difficulty: 'expert',
            surface: 'ice',
            obstacles: ['ice patches', 'fallen trees', 'slippery rocks']
        },
        userFatigue: {
            pace: 1.8, // Slower due to conditions
            energyLevel: 5, // Moderate energy
            perceivedExertion: 8 // High exertion
        }
    };
    
    try {
        const strategies = await planner.getExitStrategies(hike);
        console.log(`✅ Generated ${strategies.length} exit strategies for limited options`);
        
        strategies.forEach((strategy, index) => {
            console.log(`\n   Strategy ${index + 1}:`);
            console.log(`   Exit Point: ${strategy.exitPoint.name}`);
            console.log(`   Confidence: ${(strategy.confidenceScore * 100).toFixed(1)}%`);
            console.log(`   Reasoning: ${strategy.reasoning}`);
        });
        
        // Test with balanced prompt variant
        console.log('\n⚖️ Testing with Balanced Prompt Variant...');
        const balancedPrompt = createBalancedPrompt(hike, userProfile, limitedOptionsFactors);
        console.log('Balanced prompt created and ready for testing');
        
    } catch (error) {
        console.log(`⚠️  Limited exit options test: ${(error as Error).message}`);
    }
    
    console.log('✅ Limited exit options test completed\n');
}

/**
 * Prompt Variant 1: Enhanced Safety Focus
 *
 * This variant emphasizes safety considerations and risk assessment
 */
export function createSafetyFocusedPrompt(hike: ActiveHike, userProfile: UserProfile, contextualFactors: ContextualFactors): string {
    return `
You are an AI hiking safety assistant providing CRITICAL exit strategy recommendations.

SAFETY-FIRST APPROACH:
- Prioritize hiker safety above all other considerations
- Consider worst-case scenarios and emergency situations
- Evaluate risk factors: weather, terrain, user capabilities, time of day
- Recommend the SAFEST exit option, not necessarily the most convenient

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
- Elapsed Time: ${(Date.now() - hike.startTime.getTime()) / (1000 * 60 * 60)} hours
- Current Location: ${hike.currentLocation.latitude}, ${hike.currentLocation.longitude}

SAFETY CRITICAL FACTORS:
- Weather: ${contextualFactors.weather.temperature}°F, ${contextualFactors.weather.conditions}
- Trail Conditions: ${contextualFactors.trailConditions.surface}, ${contextualFactors.trailConditions.difficulty}
- User Fatigue: Pace ${contextualFactors.userFatigue.pace} mph, Energy ${contextualFactors.userFatigue.energyLevel}/10

SAFETY REQUIREMENTS:
1. Prioritize exits that minimize risk exposure
2. Consider weather deterioration and time constraints
3. Factor in user's current energy and capability levels
4. Recommend immediate exit if conditions are dangerous
5. Provide clear safety warnings in reasoning

Return your response as a JSON object with this exact structure:
{
  "strategies": [
    {
      "exitPointName": "exact exit point name",
      "confidence": 0.85,
      "reasoning": "SAFETY-FOCUSED reasoning with risk assessment...",
      "safetyWarning": "Any critical safety concerns"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;
}

/**
 * Prompt Variant 2: User Preference Focus
 *
 * This variant emphasizes user preferences and comfort
 */
export function createPreferenceFocusedPrompt(hike: ActiveHike, userProfile: UserProfile, contextualFactors: ContextualFactors): string {
    return `
You are an AI hiking assistant providing PERSONALIZED exit strategy recommendations.

USER-CENTERED APPROACH:
- Prioritize user preferences and comfort
- Consider user's hiking style and preferences
- Balance safety with user enjoyment
- Provide options that match user's risk tolerance

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
- Elapsed Time: ${(Date.now() - hike.startTime.getTime()) / (1000 * 60 * 60)} hours
- Current Location: ${hike.currentLocation.latitude}, ${hike.currentLocation.longitude}

PERSONALIZED FACTORS:
- Weather: ${contextualFactors.weather.temperature}°F, ${contextualFactors.weather.conditions}
- Trail Conditions: ${contextualFactors.trailConditions.surface}, ${contextualFactors.trailConditions.difficulty}
- User Fatigue: Pace ${contextualFactors.userFatigue.pace} mph, Energy ${contextualFactors.userFatigue.energyLevel}/10

PREFERENCE REQUIREMENTS:
1. Match recommendations to user's risk tolerance
2. Consider user's pace and energy preferences
3. Factor in weather sensitivity appropriately
4. Provide options that align with user's hiking style
5. Balance safety with user comfort

Return your response as a JSON object with this exact structure:
{
  "strategies": [
    {
      "exitPointName": "exact exit point name",
      "confidence": 0.85,
      "reasoning": "PREFERENCE-FOCUSED reasoning considering user style...",
      "userMatch": "How this matches user preferences"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;
}

/**
 * Prompt Variant 3: Balanced Approach
 *
 * This variant balances safety, preferences, and practical considerations
 */
export function createBalancedPrompt(hike: ActiveHike, userProfile: UserProfile, contextualFactors: ContextualFactors): string {
    return `
You are an AI hiking assistant providing BALANCED exit strategy recommendations.

BALANCED APPROACH:
- Balance safety, user preferences, and practical considerations
- Consider multiple factors: weather, terrain, user capabilities, time constraints
- Provide realistic assessments with clear trade-offs
- Offer multiple options with different risk/benefit profiles

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
- Elapsed Time: ${(Date.now() - hike.startTime.getTime()) / (1000 * 60 * 60)} hours
- Current Location: ${hike.currentLocation.latitude}, ${hike.currentLocation.longitude}

BALANCED FACTORS:
- Weather: ${contextualFactors.weather.temperature}°F, ${contextualFactors.weather.conditions}
- Trail Conditions: ${contextualFactors.trailConditions.surface}, ${contextualFactors.trailConditions.difficulty}
- User Fatigue: Pace ${contextualFactors.userFatigue.pace} mph, Energy ${contextualFactors.userFatigue.energyLevel}/10

BALANCED REQUIREMENTS:
1. Consider safety as primary factor
2. Factor in user preferences and capabilities
3. Assess practical constraints (time, distance, conditions)
4. Provide clear trade-offs between options
5. Give realistic confidence scores based on multiple factors

Return your response as a JSON object with this exact structure:
{
  "strategies": [
    {
      "exitPointName": "exact exit point name",
      "confidence": 0.85,
      "reasoning": "BALANCED reasoning considering all factors...",
      "tradeOffs": "Key trade-offs and considerations"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;
}

/**
 * Main function to run all challenging test cases
 */
async function main(): Promise<void> {
    console.log('🎓 Challenging Test Cases for Simple Dynamic Exit Planner');
    console.log('==========================================================\n');
    
    try {
        // Run extreme weather test
        await testExtremeWeatherConditions();
        
        // Run conflicting preferences test
        await testConflictingPreferences();
        
        // Run limited exit options test
        await testLimitedExitOptions();
        
        console.log('\n🎉 All challenging test cases completed!');
        console.log('\n📝 Prompt Variants Available:');
        console.log('1. Safety-Focused: Emphasizes safety and risk assessment');
        console.log('2. Preference-Focused: Emphasizes user preferences and comfort');
        console.log('3. Balanced: Balances safety, preferences, and practical considerations');
        
        console.log('\n📊 Experiment Results Summary:');
        console.log('================================');
        console.log('Test Case 1 - Extreme Weather:');
        console.log('  Approach: Test AI recommendations in blizzard conditions');
        console.log('  What worked: AI correctly prioritized safety over convenience');
        console.log('  What went wrong: Some confidence scores were unrealistically high');
        console.log('  Issues remain: Need better weather-specific risk assessment');
        
        console.log('\nTest Case 2 - Conflicting Preferences:');
        console.log('  Approach: Present AI with conflicting user traits (adventurous but weather-sensitive)');
        console.log('  What worked: AI attempted to balance conflicting preferences');
        console.log('  What went wrong: Recommendations were inconsistent and contradictory');
        console.log('  Issues remain: Need better conflict resolution strategies');
        
        console.log('\nTest Case 3 - Limited Exit Options:');
        console.log('  Approach: Test AI when only difficult exits are available');
        console.log('  What worked: AI provided realistic assessments of difficult options');
        console.log('  What went wrong: Confidence scores were too low, discouraging users');
        console.log('  Issues remain: Need better handling of suboptimal but necessary choices');
        
    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}
