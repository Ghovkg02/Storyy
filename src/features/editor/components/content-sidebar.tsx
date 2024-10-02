import { useState, useEffect } from "react";
import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import {
  ActiveTool,
  Editor,
  Narrative,
  RefinementLoop,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, TriangleAlert } from "lucide-react";
import * as React from "react";
import { ResponseType } from "@/features/projects/api/use-get-project";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateNarratives } from "@/features/narratives/api/use-create-narratives";
import { useGetNarratives } from "@/features/narratives/api/use-get-narratives";

interface ContentSidebarProps {
  projectId: string;
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  generatedContent: any[];
  setGeneratedContent: (content: any[]) => void;
  selectedNarrative: Narrative | null;
  setSelectedNarrative: (content: Narrative | null) => void;
  brandLogo: File | null;
  setBrandLogo: (image: File | null) => void;
  productImage: File | null;
  setProductImage: (image: File | null) => void;
  extraAssets: File | null;
  setExtraAssets: (image: File | null) => void;
  setToggleEditNarrative: (value: boolean) => void;
  setIsAiEditMode: (value: boolean) => void;
  refinementLoopSetting: RefinementLoop;
}

export const ContentSidebar = ({
  projectId,
  editor,
  activeTool,
  onChangeActiveTool,
  generatedContent,
  setGeneratedContent,
  selectedNarrative,
  setSelectedNarrative,
  brandLogo,
  setBrandLogo,
  productImage,
  setProductImage,
  extraAssets,
  setExtraAssets,
  setToggleEditNarrative,
  setIsAiEditMode,
  refinementLoopSetting,
}: ContentSidebarProps) => {
  const { mutate } = useCreateNarratives();
  const { data, error, isLoading } = useGetNarratives(projectId);
  const { shouldBlock, triggerPaywall } = usePaywall();
  const [brandName, setBrandName] = useState("");
  const [productName, setProductName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [style, setStyle] = useState("");
  const [audience, setAudience] = useState("");
  const [description, setDescription] = useState("");
  const [font, setFont] = useState("");
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [contentError, setContentError] = useState<any>(null);

  useEffect(() => {
    if (data) {
      setGeneratedContent([
        JSON.parse(data.narrative_0 === null ? "" : data.narrative_0),
        JSON.parse(data.narrative_1 === null ? "" : data.narrative_1),
        JSON.parse(data.narrative_2 === null ? "" : data.narrative_2),
        JSON.parse(data.narrative_3 === null ? "" : data.narrative_3),
      ]);
      // console.log(data)
    }
  }, [data]);

  const handleContentGeneration = async () => {
    setContentLoading(true);
    setGeneratedContent([]);
    setSelectedNarrative(null);
    setContentError(null);
    const formData = new FormData();
    formData.append("brand_name", brandName);
    formData.append("brand_logo", brandLogo || "");
    formData.append("product_name", productName);
    formData.append("product_image", productImage || "");
    formData.append("narrative", narrative);
    formData.append("style", style);
    formData.append("audience", audience);
    formData.append("product_description", description);
    formData.append("extra_assets", extraAssets || "");
    formData.append("font", font);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_FRONTEND}/generate-narratives`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // console.log(response.data);
      for (let narr in response.data.narratives)
        response.data.narratives[narr]["productName"] = productName;
      setGeneratedContent(response.data.narratives);
      mutate({
        projectId: projectId,
        narrative_0: JSON.stringify(response.data.narratives[0]),
        narrative_1: JSON.stringify(response.data.narratives[1]),
        narrative_2: JSON.stringify(response.data.narratives[2]),
        narrative_3: JSON.stringify(response.data.narratives[3]),
      });
      setContentLoading(false);
    } catch (error) {
      console.error("Error generating content:", error);
      setContentLoading(false);
      setContentError(error);
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleSelectNarrative = (narrative: Narrative) => {
    setSelectedNarrative(narrative);
    setToggleEditNarrative(true);
  };

  const refineImage = async () => {
    onChangeActiveTool("ai");
    setIsAiEditMode(true);
    const agentData = new FormData();
    agentData.append("projectID", projectId);
    agentData.append("narrative", JSON.stringify(selectedNarrative));
    agentData.append("json_image_string", " ");
    agentData.append("config", JSON.stringify(refinementLoopSetting));

    const refined = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_SERVER_FRONTEND}/startAgent/`,
      agentData
    );
    setIsAiEditMode(false);
    return refined.data;
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[51] w-[40%] h-full flex flex-col",
        activeTool === "content" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Ad Generator"
        description="Generate ad content and images"
      />
      <ScrollArea>
        <form className="p-4 space-y-6">
          <div className="form-row flex space-x-4">
            <div className="form-group flex-1">
              <label>Brand Name</label>
              <Input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Brand Name"
                className="text-sm"
              />
            </div>
            <div className="form-group flex-1">
              <label>Brand Logo</label>
              <Input
                type="file"
                onChange={(e) =>
                  setBrandLogo(e.target.files ? e.target.files[0] : null)
                }
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>
          </div>
          <div className="form-row flex space-x-4">
            <div className="form-group flex-1">
              <label>Product Name</label>
              <Input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product Name"
                className="text-sm"
              />
            </div>
            <div className="form-group flex-1">
              <label>Product Image</label>
              <Input
                type="file"
                onChange={(e) =>
                  setProductImage(e.target.files ? e.target.files[0] : null)
                }
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>
          </div>
          {/* <div className="form-group">
            <label>Narrative</label>
            <Textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Narrative"
              className="text-sm"
            />
          </div> */}
          <div className="form-row flex space-x-4">
            <div className="form-group flex-1">
              <label>Style</label>
              <Input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Style"
                className="text-sm"
              />
            </div>
            <div className="form-group flex-1">
              <label>Audience</label>
              <Input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Audience"
                className="text-sm"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="text-sm"
            />
          </div>

          <div className="form-row flex space-x-4">
            <div className="form-group flex-1">
              <label>Extra Assets</label>
              <Input
                type="file"
                onChange={(e) =>
                  setExtraAssets(e.target.files ? e.target.files[0] : null)
                }
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>
          </div>

          {/* <div>
            <div className="form-group flex-1">
              <label>Font</label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Font</SelectLabel>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div> */}

          <Button
            type="button"
            onClick={handleContentGeneration}
            className="w-full"
          >
            Generate Content
          </Button>
        </form>

        {(isLoading || contentLoading) && (
          <div className="h-full flex flex-col items-center justify-center mb-4">
            <Loader className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {contentError && (
          <div className="h-full flex flex-col gap-y-5 items-center justify-center mb-4">
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <TriangleAlert className="size-6 text-muted-foreground" />
              Some Error Occured. Try Again!!!
            </p>
          </div>
        )}
        {generatedContent.length > 0 && (
          <div className="p-4 space-y-4">
            <h2>Generated Content</h2>
            {generatedContent.map((narrative, index) => (
              <div
                key={index}
                className={`narrative-box ${
                  selectedNarrative === narrative ? "selected" : ""
                }`}
                onClick={() => {
                  narrative["index"] = index;
                  handleSelectNarrative(narrative);
                }}
              >
                <h3>{narrative.title.text}</h3>
                <p>
                  <strong>Tagline:</strong> {narrative.tagline.text}
                </p>
                <p>
                  <strong>Description:</strong> {narrative.image.description}
                </p>
                {/* <p><strong>Color Palette:</strong> {narrative.color_palette}</p>
              <p><strong>Layout:</strong> {narrative.layout}</p>
              <p><strong>Main Image:</strong> {narrative.main_image}</p>
              <p><strong>Background:</strong> {narrative.background}</p> */}
              </div>
            ))}
            {selectedNarrative &&
              editor &&
              editor.canvas &&
              editor.canvas._objects &&
              editor?.canvas?._objects?.length > 1 && (
                <Button type="button" onClick={refineImage} className="w-full">
                  Refine Image
                </Button>
              )}
          </div>
        )}
        {/* {generatedImage && (
          <div className="p-4 space-y-4">
            <h2>Generated Image</h2>
            <img src={generatedImage} alt="Generated" />
          </div>
        )} */}
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
