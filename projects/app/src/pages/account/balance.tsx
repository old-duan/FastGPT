/**
 * 余额页面
 * /account/balance
 */

'use client';
import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AccountContainer from '@/pageComponents/account/AccountContainer';
import { serviceSideProps } from '@/web/common/i18n/utils';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useUserStore } from '@/web/support/user/useUserStore';
import { formatStorePrice2Read } from '@fastgpt/global/support/wallet/usage/tools';

// 积分兑换比例
const POINTS_PER_YUAN = 100;

const BalancePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userInfo, initUserInfo } = useUserStore();

  // URL 参数
  const { success, orderId, error } = router.query;

  // 当前余额（积分）
  const currentBalance = useMemo(() => {
    return formatStorePrice2Read(userInfo?.team?.balance || 0);
  }, [userInfo?.team?.balance]);

  const currentPoints = useMemo(() => {
    return (currentBalance * POINTS_PER_YUAN).toFixed(0);
  }, [currentBalance]);

  // 支付成功后刷新用户信息
  useEffect(() => {
    if (success === 'true') {
      // 延迟刷新，等待异步回调处理完成
      setTimeout(() => {
        initUserInfo();
      }, 2000);
    }
  }, [success]);

  return (
    <AccountContainer>
      <Flex
        direction="column"
        maxW="800px"
        mx="auto"
        p={[4, 6, 8]}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
      >
        {/* 支付成功提示 */}
        {success === 'true' && (
          <Alert status="success" variant="subtle" borderRadius="md" mb={6}>
            <AlertIcon />
            <Box flex={1}>
              <AlertTitle>支付成功！</AlertTitle>
              <AlertDescription>
                订单号：{orderId}
                <br />
                积分将在 2-5 分钟内到账，请稍后刷新页面查看。
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* 支付失败提示 */}
        {error && (
          <Alert status="error" variant="subtle" borderRadius="md" mb={6}>
            <AlertIcon />
            <Box flex={1}>
              <AlertTitle>支付失败</AlertTitle>
              <AlertDescription>
                {error === 'invalid_sign' && '签名验证失败，请联系客服'}
                {error === 'payment_failed' && '支付失败，请重试'}
                {error === 'invalid_method' && '请求方法错误'}
                {error === 'unknown' && '未知错误，请联系客服'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* 标题 */}
        <HStack spacing={3} mb={6}>
          <MyIcon name="common/wallet" w="24px" h="24px" color="primary.600" />
          <Text fontSize="2xl" fontWeight="bold">
            账户余额
          </Text>
        </HStack>

        {/* 余额卡片 */}
        <Box
          p={8}
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          borderRadius="xl"
          color="white"
          mb={6}
          boxShadow="xl"
        >
          <VStack align="start" spacing={4}>
            <Text fontSize="sm" opacity={0.9}>
              当前余额
            </Text>
            <HStack spacing={2}>
              <Text fontSize="5xl" fontWeight="bold">
                ¥{currentBalance.toFixed(2)}
              </Text>
            </HStack>
            <Text fontSize="md" opacity={0.8}>
              可用积分：{currentPoints} 积分
            </Text>
          </VStack>
        </Box>

        {/* 操作按钮 */}
        <Flex gap={4} mb={6}>
          <Button
            flex={1}
            size="lg"
            colorScheme="primary"
            leftIcon={<MyIcon name="common/addCircleLight" w="18px" />}
            onClick={() => router.push('/account/recharge')}
          >
            立即充值
          </Button>
          <Button
            flex={1}
            size="lg"
            variant="outline"
            leftIcon={<MyIcon name="common/documentLight" w="18px" />}
            onClick={() => router.push('/account/usage')}
          >
            查看用量
          </Button>
        </Flex>

        {/* 使用说明 */}
        <Box p={5} bg="gray.50" borderRadius="md">
          <VStack align="stretch" spacing={3}>
            <Text fontSize="md" fontWeight="medium">
              💡 余额使用说明
            </Text>

            <HStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">
                •
              </Text>
              <Text fontSize="sm" color="gray.600">
                <strong>1 元 = {POINTS_PER_YUAN} 积分</strong>，用于对话、知识库等功能消费
              </Text>
            </HStack>

            <HStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">
                •
              </Text>
              <Text fontSize="sm" color="gray.600">
                <strong>按需计费</strong>：根据实际使用量扣除积分，无固定月费
              </Text>
            </HStack>

            <HStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">
                •
              </Text>
              <Text fontSize="sm" color="gray.600">
                <strong>实时扣费</strong>：每次对话后立即扣除相应积分
              </Text>
            </HStack>

            <HStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">
                •
              </Text>
              <Text fontSize="sm" color="gray.600">
                <strong>余额不足</strong>：当余额低于 100 积分时，请及时充值
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* 快速充值建议 */}
        {currentBalance < 10 && (
          <Box p={5} bg="red.50" borderRadius="md" mt={4} borderLeft="4px" borderColor="red.500">
            <HStack align="start" spacing={3}>
              <MyIcon name="common/warning" w="20px" h="20px" color="red.500" mt={0.5} />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="md" fontWeight="bold" color="red.700">
                  余额不足提醒
                </Text>
                <Text fontSize="sm" color="red.600">
                  您的账户余额已不足 ¥10，为避免影响使用，建议尽快充值。
                </Text>
                <Button
                  size="sm"
                  colorScheme="red"
                  mt={2}
                  onClick={() => router.push('/account/recharge')}
                >
                  立即充值
                </Button>
              </VStack>
            </HStack>
          </Box>
        )}
      </Flex>
    </AccountContainer>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: {
      ...(await serviceSideProps(context, ['account']))
    }
  };
}

export default BalancePage;
