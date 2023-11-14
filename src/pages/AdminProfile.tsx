import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import {SsidChartOutlined, TaskAltOutlined} from "@mui/icons-material";
import {CustomTooltipProps, Document, Task} from "../types";
import axios from "axios";
import {PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip} from 'recharts';
import {useLocalStorage} from "react-use";
import {useNavigate} from "react-router-dom";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Modal from "../components/Modal";
import {FieldValues, SubmitHandler, useForm} from "react-hook-form";

const Container = styled.div`
  display: flex;
  min-height: 76.3vh;
  background-color: rgb(255, 255, 255);
`

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 76.3vh;
  height: 76.3vh;
  width: 15vw;
  gap: 1.5vw;
`

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 76.3vh;
  width: 85vw;
  border-left: .15vw solid rgb(0, 0, 0);
`

const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10vh;
  border-bottom: .15vw solid rgb(0, 0, 0);
`

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 63.5vh;
  gap: 5vw;
  margin-bottom: 2.5vw;
`

const Title = styled.h3`
  margin-left: .5vw;
`

const Button = styled.button`
  font-size: 1rem;
  border: none;
  background-color: rgb(96, 96, 218);
  color: rgb(255, 255, 255);
  width: 7.5vw;
  height: 5.5vh;
  border-radius: .5vw;
  cursor: pointer;
  transition: .5s ease-out;

  &:hover {
    transform: scale(1.1);
  }
`

const CategoryContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  margin-top: 2.5vw;
`

const Category = styled.p`
  margin: 0;
  font-size: 1.25rem;
  cursor: pointer;
`

const TasksContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  flex-wrap: wrap;
  width: 100%;
  gap: 2.5vw;
`

const GraphsContainer = styled.div`
  margin-top: 2.5vw;
  margin-left: 2.5vw;
  width: 80vw;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`

const Graph = styled.div``

const Label = styled.label`
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 1vw;
`

const Select = styled.select`
  appearance: none;
  border: 0;
  outline: 0;
  font: inherit;
  width: 20vw;
  padding: .5vw 5vw .5vw .5vw;
  background: url(https://upload.wikimedia.org/wikipedia/commons/9/9a/Caret_down_font_awesome.svg) no-repeat right 0.8em center / 1.4em,
  linear-gradient(to left, rgba(255, 255, 255, 0.3) 3em, rgba(255, 255, 255, 0.2) 3em);
  color: black;
  border-radius: 0.25vw;
  box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
`

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5vw;
`

const Input = styled.input`
  padding: 5px;
  border-radius: .5vw;
  width: 15vw;
`

const UserProfile: React.FC = () => {

    const [category, setCategory] = useState<string>("waiting")
    const [panel, setPanel] = useState<string>("tasks")
    const [documents, setDocuments] = useState<Array<Document>>([])
    const [tasksInWait, setTasksInWait] = useState<Array<Task>>([])
    const [tasksInExecute, setTasksInExecute] = useState<Array<Task>>([])
    const [tasksInDone, setTasksInDone] = useState<Array<Task>>([])
    const [selectedDocument, setSelectedDocument] = useState<string>("")
    const [user, setUser] = useLocalStorage("user")
    const navigate = useNavigate()
    const [percentExecute, setPercentExecute] = useState<number>(0)
    const [allStatistic, setAllStatistic] = useState<Record<string, number>>({})
    const [percentRollBack, setPercentRollBack] = useState<number>(0)
    const [tasks, setTasks] = useState<Array<Task>>([])
    const [modalActive, setModalActive] = useState<boolean>(false)
    const {register, handleSubmit} = useForm()

    useEffect(() => {
        (async () => {
            await axios.get("http://localhost:8080/api/documents/getAll_documents")
                .then((res) => setDocuments(res.data))
            await axios.get("http://localhost:8080/api/tasks/wait", {
                headers: {
                    Authorization: `Bearer ${JSON.parse(user as string)?.token}`
                }
            })
                .then((res) => {
                    console.log(res.data.content)
                    setTasksInWait(res.data.content)
                })
            await axios.get("http://localhost:8080/api/tasks/execute", {
                headers: {
                    Authorization: `Bearer ${JSON.parse(user as string)?.token}`
                }
            })
                .then((res) => {
                    setTasksInExecute(res.data.content)
                })
            await axios.get("http://localhost:8080/api/tasks/done", {
                headers: {
                    Authorization: `Bearer ${JSON.parse(user as string)?.token}`
                }
            })
                .then((res) => {
                    setTasksInDone(res.data.content)
                })

            await axios.get("http://localhost:8080/api/tasks/all", {
                headers: {
                    Authorization: `Bearer ${JSON.parse(user as string)?.token}`
                }
            })
                .then((res) => {
                    setTasks(res.data.content)
                })
        })()
    }, [user])

    const idString = tasksInWait.map(task => task.idTask).join(',')

    const onChangeDocument = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value

        await axios.get(`http://localhost:8080/api/tasks/statistic/statistics/${selectedValue}`, {
            headers: {
                Authorization: `Bearer ${JSON.parse(user as string)?.token}`
            }
        })
            .then((res) => {
                console.log(res.data)
                setAllStatistic(res.data)
            })

        await axios.get(`http://localhost:8080/api/tasks/statistic/percent-rollback/${selectedValue}`, {
            headers: {
                Authorization: `Bearer ${JSON.parse(user as string)?.token}`
            }
        })
            .then((res) => {
                setPercentRollBack(res.data)
            })

        setSelectedDocument(selectedValue)
    }

    const onChangeTask = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value

        await axios.get(`http://localhost:8080/api/tasks/statistic/percent-execute/${selectedValue}`, {
            headers: {
                Authorization: `Bearer ${JSON.parse(user as string)?.token}`
            }
        })
            .then((res) => {
                setPercentExecute(res.data)
            })

        setSelectedDocument(selectedValue)
    }

    const onChangePriority: SubmitHandler<FieldValues> = async (data) => {
        const idTaskUpdate = data.idTaskUpdate.split(",").map(Number)
        await axios.put(`http://localhost:8080/api/tasks/change-priority?id_document=${parseInt(data.idDocument, 10)}`, idTaskUpdate, {
            headers: {
                Authorization: `Bearer ${JSON.parse(user as string)?.token}`
            }
        }).then(() => navigate(0))
    }

    const percentExecuteData = [
        {name: "Выполнено", value: percentExecute * 100},
        {name: "Не выполнено", value: 100 - (percentExecute * 100)}
    ]

    const allStatisticData = Object.keys(allStatistic).map((key) => ({
        name: key,
        value: allStatistic[key] * 100
    }))

    const percentRollBackData = [
        {name: 'Откат', value: percentRollBack},
        {name: 'Осталось', value: 100 - percentRollBack}
    ]

    const CustomTooltip: React.FC<CustomTooltipProps> = ({active, payload}) => {
        if (active && payload && payload.length) {
            return (
                <div style={{background: 'white', border: '1px solid #ccc', padding: '10px'}}>
                    <p>{`${payload[0].name} : ${payload[0].value}`}</p>
                </div>
            )
        }

        return null
    }

    const rollBackTask = async (id: number) => {
        await axios.post(`http://localhost:8080/api/tasks/rollback/${id}/document/${selectedDocument}`, {}, {
            headers: {
                Authorization: `Bearer ${JSON.parse(user as string)?.token}`
            }
        })
            .then((res) => {
                setPercentRollBack(res.data)
                navigate(0)
            })
    }

    return (
        <Container>
            <LeftContainer>
                <Title>Пользователь: {JSON.parse(user as string)?.username}</Title>
                Задачи
                <TaskAltOutlined style={{cursor: "pointer"}} fontSize="large" onClick={() => setPanel("tasks")}/>
                Графики
                <SsidChartOutlined style={{cursor: "pointer"}} fontSize="large" onClick={() => setPanel("graphs")}/>
                <Button style={{backgroundColor: "red"}} onClick={() => {
                    setUser("")
                    navigate("/home")
                    navigate(0)
                }}>Выйти с аккаунта</Button>
            </LeftContainer>
            <RightContainer>
                <TopContainer>
                    <Label>
                        <Select onChange={onChangeDocument}>
                            <option value="">Выберите документ</option>
                            {documents?.map((document, index) => (
                                <option key={index} value={document.idDocument}>{document.fileName}</option>
                            ))}
                        </Select>
                    </Label>
                    <Label style={{marginLeft: "2.5vw"}}>
                        <Select onChange={onChangeTask}>
                            <option value="">Выберите задачу</option>
                            {tasks?.map((task, index) => (
                                <option key={index} value={task.idTask}>{task.nameTask}</option>
                            ))}
                        </Select>
                    </Label>
                </TopContainer>
                <BottomContainer>
                    <CategoryContainer style={{display: panel !== "tasks" ? "none" : "flex"}}>
                        <Category onClick={() => setCategory("waiting")}>Ожидающие задания</Category>
                        <Category onClick={() => setCategory("executing")}>Выполняющиеся задания</Category>
                        <Category onClick={() => setCategory("complete")}>Выполненные задания</Category>
                    </CategoryContainer>
                    <TasksContainer style={{display: panel !== "tasks" ? "none" : "flex"}}>
                        <TableContainer style={{display: category !== "waiting" ? "none" : "flex"}} sx={{width: 950}}
                                        component={Paper}>
                            <Table sx={{width: 950}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Задача</TableCell>
                                        <TableCell>Подзадачи</TableCell>
                                        <TableCell>Выполнят</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tasksInWait.map((task, index) => (
                                        <TableRow key={index}
                                                  sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                            <TableCell component="th" scope="row">
                                                {task.nameTask}
                                            </TableCell>
                                            <TableCell>
                                                <ul>
                                                    {task.sequentialTaskNodeDTOS.map((taskNode, index) => (
                                                        <li key={index}>{taskNode.name_node}</li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                            <TableCell>
                                                <ul>
                                                    {task.employees.map((employee, index) => (
                                                        <li key={index}>{employee.surname + " " + employee.name + " " + employee.patronymic}</li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TableContainer style={{display: category !== "executing" ? "none" : "flex"}} sx={{width: 950}}
                                        component={Paper}>
                            <Table sx={{width: 950}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Задача</TableCell>
                                        <TableCell>Подзадачи</TableCell>
                                        <TableCell>Выполняют</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tasksInExecute.map((task, index) => (
                                        <TableRow key={index}
                                                  sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                            <TableCell component="th" scope="row">
                                                {task.nameTask}
                                            </TableCell>
                                            <TableCell>
                                                <ul>
                                                    {task.sequentialTaskNodeDTOS.map((taskNode, index) => (
                                                        <li key={index}>{taskNode.name_node}</li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                            <TableCell>
                                                <ul>
                                                    {task.employees.map((employee, index) => (
                                                        <li key={index}>{employee.surname + " " + employee.name + " " + employee.patronymic}</li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TableContainer style={{display: category !== "complete" ? "none" : "flex"}} sx={{width: 950}}
                                        component={Paper}>
                            <Table sx={{width: 950}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Задача</TableCell>
                                        <TableCell>Подзадачи</TableCell>
                                        <TableCell>Выполнили</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tasksInDone.map((task, index) => (
                                        <TableRow style={{cursor: "pointer"}} key={index}
                                                  sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                        onClick={() => rollBackTask(task.idTask)}>
                                            <TableCell component="th" scope="row">
                                                {task.nameTask}
                                            </TableCell>
                                            <TableCell>
                                                <ul>
                                                    {task.sequentialTaskNodeDTOS.map((taskNode, index) => (
                                                        <li key={index}>{taskNode.name_node}</li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                            <TableCell>
                                                <ul>
                                                    {task.employees.map((employee, index) => (
                                                        <li key={index}>{employee.surname + " " + employee.name + " " + employee.patronymic}</li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button style={{display: category !== "waiting" ? "none" : "flex"}} onClick={() => {
                            setModalActive(true)
                        }}>Смена приоритета задач</Button>
                    </TasksContainer>
                    <GraphsContainer style={{display: panel !== "graphs" ? "none" : "flex"}}>
                        <Graph>
                            <h2>Процент выполнения</h2>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={percentExecuteData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {
                                        percentExecuteData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? "#0088FE" : "#00C49F"}/>
                                        ))
                                    }
                                </Pie>
                                <Tooltip content={<CustomTooltip/>}/>
                            </PieChart>
                        </Graph>
                        <Graph>
                            <h2>Статистика задач</h2>
                            <BarChart width={400} height={300} data={allStatisticData}>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value" fill="#8884d8"/>
                            </BarChart>
                        </Graph>
                        <Graph>
                            <h2>Процент отката</h2>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={percentRollBackData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {
                                        percentRollBackData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? "#FF8042" : "#00C49F"}/>
                                        ))
                                    }
                                </Pie>
                                <Tooltip content={<CustomTooltip/>}/>
                            </PieChart>
                        </Graph>
                    </GraphsContainer>
                </BottomContainer>
            </RightContainer>
            <Modal active={modalActive} setActive={setModalActive}>
                <ModalContainer>
                    <Form onSubmit={handleSubmit(onChangePriority)}>
                        <Title>Смена приоритета задач</Title>
                        <Select {...register("idDocument")}>
                            <option value="">Выберите документ</option>
                            {documents?.map((document, index) => (
                                <option key={index} value={document.idDocument}>{document.fileName}</option>
                            ))}
                        </Select>
                        <Input {...register("idTaskUpdate")} defaultValue={idString}/>
                        <Button type="submit">Сменить</Button>
                    </Form>
                </ModalContainer>
            </Modal>
        </Container>
    )
}

export default UserProfile
