import { Heading, VStack, useToast } from "native-base";
import { useState } from "react";
import { api } from "../services/api";
import { Button } from "../components/button";
import { Header } from "../components/header";
import { Input } from "../components/input";
import { useNavigation } from "@react-navigation/native";

export function Find() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");

  const toast = useToast();
  const { navigate } = useNavigation();

  async function handleJoinPool() {
    try {
      setIsLoading(true);

      if (!code.trim()) {
        setIsLoading(false);
        return toast.show({
          title: "Informe o código.",
          bgColor: "red.500",
          placement: "top",
          duration: 2000,
        });
      }

      await api.post("/pools/join", { code });

      toast.show({
        title: "Você entrou no bolão com sucesso.",
        bgColor: "green.500",
        placement: "top",
        duration: 2000,
      });

      navigate("pools");
    } catch (error) {
      console.log(error);
      setIsLoading(false);

      if (error.response?.data?.message === "Pool not found.") {
        return toast.show({
          title: "Bolão não encontrado.",
          bgColor: "red.500",
          placement: "top",
          duration: 2000,
        });
      }

      if (error.response?.data?.message === "You already joined this pool.") {
        return toast.show({
          title: "Você já está nesse bolão.",
          bgColor: "red.500",
          placement: "top",
          duration: 2000,
        });
      }
    }
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Buscar por código" showBackButton />
      <VStack mt={8} mx={5} alignItems="center">
        <Heading
          fontFamily="heading"
          color="white"
          fontSize="xl"
          mb={8}
          textAlign="center"
        >
          Encontre um bolão através de seu código único
        </Heading>
        <Input
          autoCapitalize="characters"
          mb={2}
          placeholder="Qual o código do bolão?"
          onChangeText={setCode}
        />
        <Button
          title="BUSCAR BOLÃO"
          isLoading={isLoading}
          onPress={handleJoinPool}
        />
      </VStack>
    </VStack>
  );
}
