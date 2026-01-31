import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
            <Text className="text-xl font-bold text-gray-800">
                HabitEcho Mobile App
            </Text>
        </SafeAreaView>
    );
}
