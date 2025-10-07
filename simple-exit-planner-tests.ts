/**
 * Simple Dynamic Exit Planner Test Cases
 * 
 * Demonstrates both manual operations and LLM-assisted exit planning
 */

import { SimpleDynamicExitPlanner } from './simple-exit-planner';
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
 * Test case 1: Manual hike operations
 * Demonstrates starting a hike, updating location, and ending hike
 */
export async function testManualScheduling(): Promise<void> {
    console.log('\n🧪 TEST CASE 1: Manual Hike Operations');
    console.log('======================================');
    
    const planner = new SimpleDynamicExitPlanner(new GeminiLLM({ apiKey: 'dummy' }));
    
    // Create test user and route
    const user = {
        id: 'user1',
        name: 'Alice Johnson',
        email: 'alice@example.com'
    };

    const route = {
        id: 'route1',
        name: 'Mount Washington Loop',
        waypoints: [
            { latitude: 44.1234, longitude: -71.5678, elevation: 2000, timestamp: new Date() },
            { latitude: 44.1345, longitude: -71.5789, elevation: 2500, timestamp: new Date() },
            { latitude: 44.1456, longitude: -71.5890, elevation: 3000, timestamp: new Date() }
        ],
        totalDistance: 8.2,
        estimatedDuration: 6,
        difficulty: 'moderate' as const
    };

    // Start a hike
    console.log('🏔️ Starting hike...');
    const hike = await planner.startHike(route, user);
    console.log(`✅ Started hike: ${hike.id}`);
    console.log(`   User: ${hike.user.name}`);
    console.log(`   Route: ${hike.route.name}`);
    console.log(`   Start time: ${hike.startTime.toLocaleTimeString()}`);

    // Update location
    console.log('\n📍 Updating location...');
    const newLocation = {
        latitude: 44.1345,
        longitude: -71.5789,
        elevation: 2500,
        timestamp: new Date()
    };
    const updatedHike = await planner.updateLocation(hike, newLocation);
    console.log(`✅ Updated location: ${updatedHike.currentLocation.latitude}, ${updatedHike.currentLocation.longitude}`);

    // Display system state
    planner.displayActiveHikes();
    planner.displayExitPoints();

    // End hike
    console.log('\n🏁 Ending hike...');
    const exitPoint = planner.getExitPoints()[0];
    if (exitPoint) {
        const completedHike = await planner.endHike(updatedHike, exitPoint);
        console.log(`✅ Completed hike: ${completedHike.id}`);
        console.log(`   Duration: ${completedHike.actualDuration.toFixed(2)} hours`);
        console.log(`   Exit point: ${completedHike.exitPoint.name}`);
    }

    console.log('✅ Manual hike operations test completed\n');
}

/**
 * Test case 2: LLM-assisted exit planning
 * Demonstrates AI-powered exit strategy recommendations
 */
export async function testLLMScheduling(): Promise<void> {
    console.log('\n🧪 TEST CASE 2: LLM-Assisted Exit Planning');
    console.log('===========================================');
    
    const config = loadConfig();
    const planner = new SimpleDynamicExitPlanner(new GeminiLLM(config));
    
    // Create user profile
    const userProfile = {
        id: 'profile1',
        userId: 'user1',
        averagePace: 2.5,
        maxDistance: 12,
        riskTolerance: 'moderate' as const,
        weatherSensitivity: 'medium' as const
    };

    planner.addUserProfile(userProfile);

    // Create test hike
    const user = { id: 'user1', name: 'Alice Johnson', email: 'alice@example.com' };
    const route = {
        id: 'route2',
        name: 'Mount Washington Loop',
        waypoints: [
            { latitude: 44.1234, longitude: -71.5678, elevation: 2000, timestamp: new Date() }
        ],
        totalDistance: 8.2,
        estimatedDuration: 6,
        difficulty: 'moderate' as const
    };

    const hike = await planner.startHike(route, user);
    console.log('✅ Created test hike with user profile');

    // Test AI-powered exit strategies
    console.log('\n🎯 Testing AI-powered exit strategies...');
    try {
        const strategies = await planner.getExitStrategies(hike);
        console.log(`✅ Generated ${strategies.length} AI-powered exit strategies`);
        
        strategies.forEach((strategy, index) => {
            console.log(`\n   Strategy ${index + 1}:`);
            console.log(`   Exit Point: ${strategy.exitPoint.name}`);
            console.log(`   Confidence: ${(strategy.confidenceScore * 100).toFixed(1)}%`);
            console.log(`   Reasoning: ${strategy.reasoning}`);
        });
    } catch (error) {
        console.log(`⚠️  Exit strategies test: ${(error as Error).message}`);
    }

    // Test user state analysis
    console.log('\n🧠 Testing user state analysis...');
    const sensorData = new Map<string, any>([
        ['heartRate', 140],
        ['pace', 2.2],
        ['elevation', 2800],
        ['temperature', 45],
        ['humidity', 75]
    ]);

    try {
        const userState = await planner.analyzeUserState(hike, sensorData);
        console.log('✅ User state analysis completed');
        console.log(`   Physical State: Fatigue ${userState.physicalState?.fatigue || 'N/A'}/10, Energy ${userState.physicalState?.energy || 'N/A'}/10`);
        console.log(`   Mental State: Confidence ${userState.mentalState?.confidence || 'N/A'}/10, Stress ${userState.mentalState?.stress || 'N/A'}/10`);
    } catch (error) {
        console.log(`⚠️  User state analysis: ${(error as Error).message}`);
    }

    // Test contextual guidance
    console.log('\n💬 Testing contextual guidance...');
    const userQueries = [
        "I'm feeling tired but want to see the summit",
        "The weather is getting worse, should I continue?",
        "What's the safest way down from here?"
    ];

    for (const query of userQueries) {
        try {
            console.log(`\n   User Query: "${query}"`);
            const guidance = await planner.provideContextualGuidance(hike, query);
            console.log(`   AI Response: ${guidance.substring(0, 100)}...`);
        } catch (error) {
            console.log(`   ⚠️  Guidance error: ${(error as Error).message}`);
        }
    }

    console.log('✅ LLM-assisted exit planning test completed\n');
}

/**
 * Test case 3: Mixed operations with learning
 * Demonstrates combining manual operations with AI learning from feedback
 */
export async function testMixedScheduling(): Promise<void> {
    console.log('\n🧪 TEST CASE 3: Mixed Operations with Learning');
    console.log('==============================================');
    
    const config = loadConfig();
    const planner = new SimpleDynamicExitPlanner(new GeminiLLM(config));
    
    // Create user profile
    const userProfile = {
        id: 'profile2',
        userId: 'user2',
        averagePace: 3.0,
        maxDistance: 15,
        riskTolerance: 'adventurous' as const,
        weatherSensitivity: 'low' as const
    };

    planner.addUserProfile(userProfile);

    // Create test hike
    const user = { id: 'user2', name: 'Bob Smith', email: 'bob@example.com' };
    const route = {
        id: 'route3',
        name: 'Franconia Ridge Trail',
        waypoints: [
            { latitude: 44.1234, longitude: -71.5678, elevation: 2000, timestamp: new Date() }
        ],
        totalDistance: 9.5,
        estimatedDuration: 7,
        difficulty: 'hard' as const
    };

    const hike = await planner.startHike(route, user);
    console.log('✅ Created test hike for mixed operations');

    // Test AI recommendations
    console.log('\n🎯 Testing AI recommendations...');
    try {
        const strategies = await planner.getExitStrategies(hike);
        console.log(`✅ Generated ${strategies.length} exit strategies`);
        
        if (strategies.length > 0) {
            const selectedStrategy = strategies[0];
            console.log(`   Selected strategy: ${selectedStrategy.exitPoint.name}`);
            console.log(`   Confidence: ${(selectedStrategy.confidenceScore * 100).toFixed(1)}%`);
        }
    } catch (error) {
        console.log(`⚠️  AI recommendations: ${(error as Error).message}`);
    }

    // Test learning from feedback
    console.log('\n📚 Testing learning from feedback...');
    const feedback = {
        hikeId: hike.id,
        exitStrategyId: 'strategy1',
        satisfaction: 4,
        accuracy: 5,
        helpfulness: 4,
        comments: 'The AI recommendations were very helpful and accurate. The confidence scores were spot-on.',
    };

    try {
        const updatedProfile = await planner.learnFromUserFeedback(hike, feedback);
        console.log('✅ AI learning from feedback completed');
        console.log(`   Updated profile for user: ${updatedProfile.userId}`);
        console.log(`   Learning feedback: ${feedback.comments}`);
    } catch (error) {
        console.log(`⚠️  Learning from feedback: ${(error as Error).message}`);
    }

    // Test error handling
    console.log('\n⚠️  Testing error handling...');
    try {
        // Try to start another hike with same user
        const route2 = { ...route, id: 'route4', name: 'Another Trail' };
        await planner.startHike(route2, user);
        console.log('❌ Should have failed - user already has active hike');
    } catch (error) {
        console.log(`✅ Correctly prevented duplicate hike: ${(error as Error).message}`);
    }

    // Test operations on inactive hike
    try {
        const inactiveHike = { ...hike, isActive: false };
        await planner.updateLocation(inactiveHike, hike.currentLocation);
        console.log('❌ Should have failed - hike is inactive');
    } catch (error) {
        console.log(`✅ Correctly handled inactive hike: ${(error as Error).message}`);
    }

    console.log('✅ Mixed operations with learning test completed\n');
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
    console.log('🎓 Simple Dynamic Exit Planner Test Suite');
    console.log('==========================================\n');
    
    try {
        // Run manual operations test
        await testManualScheduling();
        
        // Run LLM-assisted test
        await testLLMScheduling();
        
        // Run mixed operations test
        await testMixedScheduling();
        
        console.log('\n🎉 All test cases completed successfully!');
        
    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}
