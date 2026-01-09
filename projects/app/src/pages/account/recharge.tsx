/**
 * 充值页面
 * /account/recharge
 */

'use client';
import React, { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Button,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Input,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Divider
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import AccountContainer from '@/pageComponents/account/AccountContainer';
import { serviceSideProps } from '@/web/common/i18n/utils';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useUserStore } from '@/web/support/user/useUserStore';
import { formatStorePrice2Read } from '@fastgpt/global/support/wallet/usage/tools';

// 预设充值金额
const PRESET_AMOUNTS = [10, 50, 100, 200, 500, 1000];

// 积分兑换比例
const POINTS_PER_YUAN = 100;

// 创建支付订单
async function createPaymentOrder(data: { amount: number; paymentMethod: string }) {
  const res = await fetch('/api/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '创建订单失败');
  }

  return res.json();
}

const RechargePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { userInfo } = useUserStore();

  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [isCustom, setIsCustom] = useState(false);

  // 计算充值金额
  const rechargeAmount = useMemo(() => {
    if (isCustom) {
      const amount = parseFloat(customAmount);
      return isNaN(amount) ? 0 : amount;
    }
    return selectedAmount;
  }, [isCustom, customAmount, selectedAmount]);

  // 计算获得积分
  const earnedPoints = useMemo(() => {
    return Math.floor(rechargeAmount * POINTS_PER_YUAN);
  }, [rechargeAmount]);

  // 当前余额（积分）
  const currentBalance = useMemo(() => {
    return formatStorePrice2Read(userInfo?.team?.balance || 0);
  }, [userInfo?.team?.balance]);

  // 创建支付订单
  const { runAsync: handleCreateOrder, loading } = useRequest2(createPaymentOrder, {
    manual: true,
    onSuccess(res) {
      // 将支付表单 HTML 写入新窗口
      const paymentWindow = window.open('about:blank', '_blank');
      if (paymentWindow) {
        paymentWindow.document.write(res.data.paymentForm);
        paymentWindow.document.close();
      } else {
        toast({
          status: 'error',
          title: '无法打开支付页面，请检查浏览器弹窗设置'
        });
      }
    },
    errorToast: '创建支付订单失败'
  });

  // 处理支付
  const handlePay = async () => {
    if (rechargeAmount <= 0) {
      toast({
        status: 'warning',
        title: '请输入有效的充值金额'
      });
      return;
    }

    if (rechargeAmount > 10000) {
      toast({
        status: 'warning',
        title: '单次充值金额不能超过 10000 元'
      });
      return;
    }

    await handleCreateOrder({
      amount: rechargeAmount,
      paymentMethod
    });
  };

  return (
    <AccountContainer>
      <Flex
        direction="column"
        maxW="900px"
        mx="auto"
        p={[4, 6, 8]}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
      >
        {/* 标题 */}
        <HStack spacing={3} mb={6}>
          <MyIcon name="common/wallet" w="24px" h="24px" color="primary.600" />
          <Text fontSize="2xl" fontWeight="bold">
            账户充值
          </Text>
        </HStack>

        {/* 当前余额 */}
        <Box p={5} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="primary.600" mb={6}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                当前余额
              </Text>
              <HStack>
                <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                  ¥{currentBalance.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  ({(currentBalance * POINTS_PER_YUAN).toFixed(0)} 积分)
                </Text>
              </HStack>
            </VStack>
            <Button size="sm" variant="outline" onClick={() => router.push('/account/usage')}>
              查看用量
            </Button>
          </HStack>
        </Box>

        {/* 充值金额选择 */}
        <VStack align="stretch" spacing={4} mb={6}>
          <Text fontSize="lg" fontWeight="medium">
            选择充值金额
          </Text>

          {/* 预设金额 */}
          <SimpleGrid columns={[2, 3]} spacing={3}>
            {PRESET_AMOUNTS.map((amount) => (
              <Box
                key={amount}
                as="button"
                p={4}
                borderWidth="2px"
                borderRadius="md"
                borderColor={!isCustom && selectedAmount === amount ? 'primary.600' : 'gray.200'}
                bg={!isCustom && selectedAmount === amount ? 'primary.50' : 'white'}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  borderColor: 'primary.600',
                  transform: 'translateY(-2px)'
                }}
                onClick={() => {
                  setIsCustom(false);
                  setSelectedAmount(amount);
                }}
              >
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="bold" color="primary.600">
                    ¥{amount}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    获得 {amount * POINTS_PER_YUAN} 积分
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

          {/* 自定义金额 */}
          <Box
            p={4}
            borderWidth="2px"
            borderRadius="md"
            borderColor={isCustom ? 'primary.600' : 'gray.200'}
            bg={isCustom ? 'primary.50' : 'white'}
          >
            <HStack>
              <Text fontSize="sm" fontWeight="medium" flex={1}>
                自定义金额
              </Text>
              <Input
                w="150px"
                size="sm"
                placeholder="输入金额"
                value={customAmount}
                onChange={(e) => {
                  setIsCustom(true);
                  setCustomAmount(e.target.value);
                }}
                onFocus={() => setIsCustom(true)}
                type="number"
                min="1"
                max="10000"
                step="1"
              />
              <Text fontSize="sm">元</Text>
            </HStack>
          </Box>
        </VStack>

        <Divider my={6} />

        {/* 支付方式选择 */}
        <VStack align="stretch" spacing={4} mb={6}>
          <Text fontSize="lg" fontWeight="medium">
            选择支付方式
          </Text>

          <RadioGroup
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value as 'alipay' | 'wechat')}
          >
            <Stack spacing={3}>
              <Box
                p={4}
                borderWidth="2px"
                borderRadius="md"
                borderColor={paymentMethod === 'alipay' ? 'primary.600' : 'gray.200'}
                bg={paymentMethod === 'alipay' ? 'primary.50' : 'white'}
                cursor="pointer"
                onClick={() => setPaymentMethod('alipay')}
              >
                <HStack>
                  <Radio value="alipay" />
                  <MyIcon name="common/alipay" w="24px" h="24px" />
                  <Text fontWeight="medium">支付宝</Text>
                  <Text fontSize="xs" color="green.500">
                    (推荐)
                  </Text>
                </HStack>
              </Box>

              <Box
                p={4}
                borderWidth="2px"
                borderRadius="md"
                borderColor={paymentMethod === 'wechat' ? 'primary.600' : 'gray.200'}
                bg={paymentMethod === 'wechat' ? 'primary.50' : 'white'}
                cursor="not-allowed"
                opacity={0.5}
              >
                <HStack>
                  <Radio value="wechat" isDisabled />
                  <MyIcon name="common/wechat" w="24px" h="24px" />
                  <Text fontWeight="medium">微信支付</Text>
                  <Text fontSize="xs" color="gray.400">
                    (暂未开通)
                  </Text>
                </HStack>
              </Box>
            </Stack>
          </RadioGroup>
        </VStack>

        <Divider my={6} />

        {/* 订单确认 */}
        <Box p={5} bg="gray.50" borderRadius="md" mb={6}>
          <VStack align="stretch" spacing={3}>
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              订单信息
            </Text>

            <HStack justify="space-between">
              <Text color="gray.600">充值金额：</Text>
              <Text fontWeight="bold">¥{rechargeAmount.toFixed(2)}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text color="gray.600">获得积分：</Text>
              <Text fontWeight="bold" color="primary.600">
                {earnedPoints} 积分
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text color="gray.600">支付方式：</Text>
              <Text fontWeight="bold">{paymentMethod === 'alipay' ? '支付宝' : '微信支付'}</Text>
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">
                实付金额：
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                ¥{rechargeAmount.toFixed(2)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* 支付按钮 */}
        <Flex gap={3}>
          <Button flex={1} variant="outline" onClick={() => router.back()} isDisabled={loading}>
            取消
          </Button>
          <Button
            flex={2}
            colorScheme="primary"
            size="lg"
            isLoading={loading}
            onClick={handlePay}
            isDisabled={rechargeAmount <= 0}
          >
            立即支付 ¥{rechargeAmount.toFixed(2)}
          </Button>
        </Flex>

        {/* 提示信息 */}
        <Box mt={6} p={4} bg="yellow.50" borderRadius="md">
          <HStack align="start" spacing={2}>
            <MyIcon name="common/info" w="16px" h="16px" color="yellow.600" mt={0.5} />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="sm" fontWeight="medium" color="yellow.700">
                充值说明
              </Text>
              <Text fontSize="xs" color="yellow.600">
                • 充值金额将转换为积分，1 元 = {POINTS_PER_YUAN} 积分
              </Text>
              <Text fontSize="xs" color="yellow.600">
                • 积分用于对话、知识库等功能的消费
              </Text>
              <Text fontSize="xs" color="yellow.600">
                • 充值成功后，积分将实时到账
              </Text>
              <Text fontSize="xs" color="yellow.600">
                • 当前使用沙箱环境测试，请使用测试账号支付
              </Text>
            </VStack>
          </HStack>
        </Box>
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

export default RechargePage;
