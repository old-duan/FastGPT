import React, { Component, type ReactNode } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 过滤掉 insertBefore 这类非致命的DOM错误,只记录但不显示错误页面
    const isNonFatalDOMError =
      error.name === 'NotFoundError' ||
      error.message?.includes('insertBefore') ||
      error.message?.includes('Node');

    if (isNonFatalDOMError) {
      console.warn('Non-fatal DOM error caught:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
      // 不显示错误页面,自动恢复
      this.setState({ hasError: false, error: null });
      return;
    }

    console.error('React Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // 上报到错误监控服务 (如果已配置)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <Flex direction="column" align="center" justify="center" minH="100vh" p={8} bg="gray.50">
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md" maxW="500px" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="red.500">
              出错了
            </Text>
            <Text mb={6} color="gray.600">
              应用遇到了一个错误,请尝试刷新页面或重试。
            </Text>
            {this.state.error && (
              <Box
                bg="gray.100"
                p={4}
                borderRadius="md"
                mb={6}
                textAlign="left"
                fontSize="sm"
                color="gray.700"
                maxH="200px"
                overflow="auto"
              >
                <Text fontWeight="bold" mb={2}>
                  错误详情:
                </Text>
                <Text>{this.state.error.message}</Text>
              </Box>
            )}
            <Flex gap={4} justify="center">
              <Button colorScheme="blue" onClick={this.resetError}>
                重试
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.reload();
                }}
              >
                刷新页面
              </Button>
            </Flex>
          </Box>
        </Flex>
      );
    }

    return this.props.children;
  }
}
