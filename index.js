const core = require('@actions/core');
const exec = require('@actions/exec');
const wait = require('./wait');

async function run() {
  try {
    const size = core.getInput('size');
    const kubeconfig_location="/tmp/output/kubeconfig-"+size+".yaml";
    console.log(`storing kubeconfig here ${kubeconfig_location}!`); 

    await exec.exec('docker', ["run","-d","--privileged","--name=knts-"+size,
    "-e","knts_KUBECONFIG_OUTPUT="+kubeconfig_location,
    "-e","knts_KUBECONFIG_MODE=666",
    "-v","/tmp/output:/tmp/output","-p","6443:6443","-p","80:80","-p","443:443","-p","8080:8080",
    "knts:"+size,"server"]);
    
    await wait(parseInt(10000));
    core.exportVariable('KUBECONFIG', kubeconfig_location);
    core.setOutput("kubeconfig", kubeconfig_location);   
    const nodeName=await exec.getExecOutput("knts get nodes --no-headers -oname");    
    var command="knts wait --for=condition=Ready "+nodeName.stdout;
    await exec.exec(command);            
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();