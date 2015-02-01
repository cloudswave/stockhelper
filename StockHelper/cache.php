<?php>
header('Content-Type: text/cache-manifest');
echo "CACHE MANIFEST\n";
 
$allHashes = ""; // 创建一个字符串保存文件的 md5 值
 
$dir = new RecursiveDirectoryIterator(".");
foreach(new RecursiveIteratorIterator($dir) as $file){ // 获取当前目录并遍历文件
    if( $file->IsFile() && // 判断获取内容为文件
        $file->getFilename() != "cache.php" && // "manifest.php" 不缓存
        !strpos( $file, '/.' ) &&
        substr( $file->getFilename(), 0, 1 ) != "."){
 
        echo "./" . $file->getFilename() . "\n";
        $allHashes .= md5_file($file); // 把每一个缓存的文件的 md5 值连接起来
    }
  
}

function traverse($path = '.') {
                 $current_dir = opendir($path);    //opendir()返回一个目录句柄,失败返回false
                 while(($file = readdir($current_dir)) !== false) {    //readdir()返回打开目录句柄中的一个条目
                     $sub_dir = $path. DIRECTORY_SEPARATOR . $file."/";    //构建子目录路径
                    if($file == '.' || $file == '..') {
                         continue;
                     } else if(is_dir($sub_dir)) {    //如果是目录,进行递归
                        //echo 'Directory ' . $file . ':<br>';
                        traverse($sub_dir);
                    } else {    //如果是文件,直接输出
                         echo '' . $path  . $file . "\n";
                    }
                 }
             }
            
traverse('../dist');
echo "http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular.min.js"."\n";
echo "http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular-route.min.js"."\n";
  
echo "FALLBACK:\n"; // 输出备选名单
echo "./cache.php \n";
 
echo "# " . md5($allHases) ."\n"; // 把连接起来的 md5 值重新计算一个 md5（因为连接所得的字符串过于冗长）

