import { useState, useEffect } from "react";
import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useGetImage } from "@/features/image/api/use-get-images";
import { Loader, TriangleAlert } from "lucide-react";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  projectId: string;
}

export const AiSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  projectId,
}: AiSidebarProps) => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [showMoreList, setShowMore] = useState([false]);
  const onClose = () => {
    onChangeActiveTool("select");
  };

  useEffect(() => {
    const eventSource = new EventSource(`/api/sse/${projectId}`);

    eventSource.addEventListener("keep-alive", (event) => {
      console.log(event.data);
    });

    eventSource.addEventListener("update", (event) => {
      const data = JSON.parse(event.data);
      editor?.loadJson(data.image);
      setUpdates((prevUpdates) => [data, ...prevUpdates]);
      setShowMore((prev) => [false, ...prev]);
    });

    eventSource.onopen = () => {
      console.log("Connection to server opened.");
    };

    eventSource.onerror = (event) => {
      console.log("SSE connection error:", event);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, editor == undefined]);

  // const { data, error, isLoading } = useGetImage(projectId);

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[51] w-[40%] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Ad Generator"
        description="Generate ad images"
      />
      <ScrollArea>
        {updates.length > 0 ? (
          updates.map((item, index) => (
            <div key={index} className="narrative-box">
              <h3 className="font-bold">{item.title}</h3>
              <br></br>
              {item!.status!.length > 300 ? (
                <div>
                  <p className="text-gray-500 text-xs">
                    {showMoreList[index] == false
                      ? item.status?.substring(0, 300)
                      : item.status}
                  </p>
                  <Button
                    className="text-gray-500 text-xs bg-transparent hover:bg-gray-200"
                    onClick={() => {
                      showMoreList[index] = !showMoreList[index];
                      setShowMore([...showMoreList]);
                    }}
                  >
                    {showMoreList[index] == false ? "Show More" : "Show Less"}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 text-xs">{item.status}</p>
              )}
            </div>
          ))
        ) : (
          <div></div>
        )}
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
