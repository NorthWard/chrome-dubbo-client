package com.north.cdc.netty;

import com.alibaba.dubbo.rpc.RpcInvocation;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;

import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class NettyClient {
    private String host;
    private int port;
    private volatile Channel channel; // volatile, please copy reference to use
    public NettyClient(String host, int port) {
        this.host = host;
        this.port = port;
        try {
            start();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    private void start() throws InterruptedException {
        Bootstrap clientBootstrap = new Bootstrap();
        clientBootstrap.option(ChannelOption.SO_KEEPALIVE, true);
        clientBootstrap.option(ChannelOption.TCP_NODELAY, true);
        InetSocketAddress inetSocketAddress = new InetSocketAddress(host, port);
        EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
        clientBootstrap.group(eventLoopGroup);
        clientBootstrap.channel(NioSocketChannel.class);
        clientBootstrap.handler(new ChannelInitializer<SocketChannel>(){
            @Override
            protected void initChannel(SocketChannel channel) throws Exception {
                channel.pipeline()
                        .addLast(new StringDecoder())
                        .addLast(new StringEncoder())
                        .addLast(new NettyClientHandler());
            }
        });
        ChannelFuture future =  clientBootstrap.connect(inetSocketAddress);
        boolean isConnect = future.awaitUninterruptibly(10, TimeUnit.SECONDS);
        if(isConnect && future.isSuccess()){
             Channel newChannel = future.channel();
             channel = newChannel;
        } else if (future.cause() != null) {
            future.cause().printStackTrace();
        } else {
            System.out.println("connect server fail");
        }
    }

    public static void main(String[] args) throws UnsupportedEncodingException {


    }
    private static void test(){
        NettyClient nettyClient = new NettyClient("localhost", 20881);
        Scanner scanner = new Scanner(System.in);
        while(scanner.hasNext()){
            String s = scanner.nextLine();
            s += "\n";
            ChannelFuture channelFuture =  nettyClient.channel.writeAndFlush(s).awaitUninterruptibly();
            if(channelFuture.isSuccess()){
                System.out.println("send :" + s);
            }else{
                System.out.println("fail :" + s);
            }
        }
    }
    public static void testRpcInvocation(){
        RpcInvocation rpcInvocation = new RpcInvocation();
    }
}
