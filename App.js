import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "./colors";
// import { EditModal } from "./EditModal";

const STORAGE_KEY = "@toDos";
const IS_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    loadToDos();
  }, []);

  const _setWorking = async (work) => {
    try {
      setEditItem(null);
      await AsyncStorage.setItem(IS_WORKING, JSON.stringify(work));
      setWorking(work);
    } catch (e) {
      console.log("_setWorking error! ==> ", e);
    }
  };

  const onChangeText = (payload) => setText(payload);

  const onChangeTodoText = (payload) => setEditText(payload);

  const saveToDos = async (toSave) => {
    try {
      setEditItem(null);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log("saveToDos error! ==> ", e);
    }
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      const isWorking = await AsyncStorage.getItem(IS_WORKING);
      setToDos(s !== null ? JSON.parse(s) : []);
      setWorking(isWorking !== null ? JSON.parse(isWorking) : true);
    } catch (e) {
      console.log("loadToDos error! ==> ", e);
    }
  };

  const onSubmit = async () => {
    if (text === "") {
      return;
    }
    try {
      // const newToDos = Object.assign({}, toDos, {
      //   [Date.now()]: { text, work: working },
      // });
      const newToDos = {
        ...toDos,
        [Date.now()]: { text, working, completed: false },
      };
      setToDos(newToDos);
      setText("");
      await saveToDos(newToDos);
    } catch (e) {
      console.log("onSubmit error! ==> ", e);
    }
  };

  const deleteToDo = (id) => {
    try {
      Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive", // Only in iOS
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[id];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
      return;
    } catch (e) {
      console.log("deleteToDo error! ==> ", e);
    }
  };

  const updateTodoState = async (id, state) => {
    try {
      const newTodos = { ...toDos };
      newTodos[id].completed = !state;
      setToDos(newTodos);
      await saveToDos(newTodos);
    } catch (e) {
      console.log("updateTodoState error! ==> ", e);
    }
  };

  const updateTodoText = async (id) => {
    try {
      if (editText !== "") {
        const newToDos = { ...toDos };
        newToDos[id].text = editText;
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    } catch (e) {
      console.log("updateTodoText error! ==> ", e);
    }
  };

  const editTodo = async (id) => {
    if (editItem !== id) {
      setEditItem(id);
    } else {
      updateTodoText(id);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => _setWorking(true)}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => _setWorking(false)}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          style={styles.input}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
          value={text}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).length > 0 ? (
          Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View key={key} style={styles.toDo}>
                {editItem && editItem === key ? (
                  <TextInput
                    style={styles.editInput}
                    onChangeText={onChangeTodoText}
                    onSubmitEditing={() => updateTodoText(key)}
                    returnKeyType="done"
                    defaultValue={toDos[key].text}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => updateTodoState(key, toDos[key].completed)}
                  >
                    <View style={styles.checkableText}>
                      {toDos[key].completed ? (
                        <MaterialCommunityIcons
                          name="checkbox-marked-outline"
                          size={15}
                          color={theme.completedText}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="checkbox-blank-outline"
                          size={15}
                          color="white"
                        />
                      )}
                      <Text
                        style={{
                          ...styles.toDoText,
                          textDecorationLine: toDos[key].completed
                            ? "line-through"
                            : "none",
                          color: toDos[key].completed
                            ? theme.completedText
                            : "white",
                        }}
                      >
                        {toDos[key].text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => editTodo(key)}
                    style={{ marginRight: 15 }}
                  >
                    {editItem !== null && editItem === key ? (
                      <Feather name="edit-3" size={15} color="white" />
                    ) : (
                      <Feather name="edit-2" size={15} color="white" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteToDo(key)}>
                    <FontAwesome name="trash-o" size={15} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )
        ) : (
          <ActivityIndicator
            color="white"
            size="large"
            style={{ marginTop: 50 }}
          />
        )}
      </ScrollView>
      {/* <EditModal visible={visible} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 15,
  },
  editInput: {
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 250,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 10,
  },
  checkableText: {
    flexDirection: "row",
    alignItems: "center",
  },
});
