import {Server} from "socket.io"
import Redis from "ioredis"
import prismaClient from "./prisma"

const pub=new Redis({
    host:"redis-3d1e9504-gamerdragion-e24e.a.aivencloud.com",
    port:23122,
    username:"default",
    password:"AVNS_2s97vfw5SB5J0zS1WH5",
})
const sub=new Redis({
    host:"redis-3d1e9504-gamerdragion-e24e.a.aivencloud.com",
    port:23122,
    username:"default",
    password:"AVNS_2s97vfw5SB5J0zS1WH5",
})

// test commit
class SocketService{
    private _io:Server
    constructor(){
        console.log("Init Socket Server...")
        this._io=new Server({
            cors:{
                allowedHeaders:['*'],
                origin:'*'
            }
        })
        sub.subscribe("MESSAGES")
    }

    public initListeners(){
        const io=this.io
        console.log("Init socket listeners")
        io.on('connect',socket=>{
            console.log(`New socket connected ${socket.id}`)
            socket.on('event:message',async({message}:{message:string})=>{
                console.log('New Message recieved:',message)
                await pub.publish("MESSAGES",JSON.stringify({message}))
            })
        })
        sub.on("message",async(channel,message)=>{
            if(channel==="MESSAGES"){{
                io.emit("message",message)
                await prismaClient.message.create({
                    data:{
                        text:message
                    }
                })
            }}
        })
    }

    get io(){
        return this._io
    }
}

export default SocketService