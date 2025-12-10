import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18next from 'i18next';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography, fontSizes } from '../theme/typography';
import { logger } from '../utils/logger';

type Props = {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Error Boundary Component
 * Catches React rendering errors and displays a fallback UI
 * Prevents the entire app from crashing due to component errors
 */
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    logger.error('Error Boundary caught error:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
    });

    // In production, this would send to error tracking service
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.handleReset}
          />
        );
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={colors.error}
            />
          </View>

          <Text style={styles.title}>{i18next.t('errorBoundary.title')}</Text>

          <Text style={styles.message}>
            {i18next.t('errorBoundary.message')}
          </Text>

          {/* Show error details in development */}
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetailsContainer}>
              <Text style={styles.errorDetailsTitle}>{i18next.t('errorBoundary.errorDetailsTitle')}</Text>
              <Text style={styles.errorDetails}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={this.handleReset}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.text} />
            <Text style={styles.buttonText}>{i18next.t('errorBoundary.retry')}</Text>
          </Pressable>

          <Text style={styles.hint}>
            Sorun devam ederse lütfen uygulamayı kapatıp yeniden açın
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.md,
    fontFamily: typography.regular,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  errorDetailsContainer: {
    backgroundColor: 'rgba(209, 14, 14, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(209, 14, 14, 0.3)',
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
    maxHeight: 200,
  },
  errorDetailsTitle: {
    fontSize: fontSizes.sm,
    fontFamily: typography.semiBold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorDetails: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.error,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontFamily: typography.semiBold,
  },
  hint: {
    fontSize: fontSizes.xs,
    fontFamily: typography.regular,
    color: colors.mutedText,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default ErrorBoundary;
