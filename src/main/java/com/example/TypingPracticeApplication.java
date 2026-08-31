package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//@SpringBootApplication 是 Spring Boot 的“总开关”:
//他负责两件事：1自动配置运行环境（你引入了starter-web，他就自动装好内嵌Tomcat）
//             2自动扫描这个包及子包里的所有组件（后面的Controller都会被他找到）
@SpringBootApplication
public class TypingPracticeApplication {
    //main方法：程序入口，和C语言一样，从这里开始执行
    public static void main(String[] args){
        //这里启动整个Spring Boot应用，网站服务器默认跑在8080端口
        SpringApplication.run(TypingPracticeApplication.class, args);
    }    
}
