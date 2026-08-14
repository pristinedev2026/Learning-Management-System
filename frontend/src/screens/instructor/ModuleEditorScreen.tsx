import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { InstructorCoursesStackParamList } from '@/navigation/InstructorTabs';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCreateModule } from '@/services/queries';
import { colors, spacing, typography } from '@/theme/tokens';
import type { Module } from '@/types';

type Props = NativeStackScreenProps<InstructorCoursesStackParamList, 'ModuleEditor'>;

type ModuleFormData = {
  title: string;
  order: string; // Use string for input, convert to number
};

/**
 * ModuleEditorScreen
 * Create or edit a module.
 */
export function ModuleEditorScreen({ route, navigation }: Props) {
  const { courseId, mode, module } = route.params;
  const createMutation = useCreateModule();
  const isLoading = createMutation.isPending;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ModuleFormData>({
    defaultValues: {
      title: module?.title ?? '',
      order: module ? String(module.order) : '',
    },
  });

  useEffect(() => {
    if (module) {
      reset({
        title: module.title,
        order: String(module.order),
      });
    }
  }, [module, reset]);

  const onSubmit = async (data: ModuleFormData) => {
    const order = parseInt(data.order, 10);
    if (!data.title || !order || order < 1) {
      Alert.alert('Error', 'Please fill in all fields correctly');
      return;
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          courseId,
          title: data.title,
          order,
        });
        Alert.alert('Success', 'Module created!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
      // TODO: Add edit support once backend has PATCH endpoint for modules
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save module');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>{mode === 'create' ? 'New Module' : 'Edit Module'}</Text>

        <Card style={styles.section}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Module Title *</Text>
            <Controller
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Getting Started"
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
              )}
            />
            {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
          </View>

          {/* Order */}
          <View style={styles.field}>
            <Text style={styles.label}>Module Number (Order) *</Text>
            <Controller
              control={control}
              name="order"
              rules={{ required: 'Order is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1"
                  placeholderTextColor={colors.inkMuted}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              )}
            />
            {errors.order && <Text style={styles.error}>{errors.order.message}</Text>}
            <Text style={styles.hint}>Modules will be displayed in this order</Text>
          </View>
        </Card>

        {/* Submit Buttons */}
        <Button
          label={isLoading ? 'Saving...' : 'Create Module'}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          style={styles.submitButton}
        />

        <Button
          label="Cancel"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  section: { gap: spacing.md },

  field: { gap: spacing.xs },
  label: { ...typography.body, fontWeight: '600', color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.background,
  },

  error: { ...typography.caption, color: colors.error },
  hint: { ...typography.caption, color: colors.inkMuted, fontStyle: 'italic' },

  submitButton: { marginTop: spacing.lg },
  cancelButton: { marginTop: spacing.md },
});
