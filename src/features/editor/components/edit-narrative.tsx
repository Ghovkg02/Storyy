import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ActiveTool,
  Narrative,
  Editor,
  RefinementLoop,
  Font,
  fonts
} from "@/features/editor/types";
import { useUpdateNarratives } from "@/features/narratives/api/use-update-narratives";
import axios from "axios";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const alignments = ['top', 'middle', 'bottom'] as const;
const horizontalAlignments = ['left', 'right', 'center'] as const;

interface EditNarrativeProps {
  editor: Editor | undefined;
  projectId: string;
  selectedNarrative: Narrative | null;
  setSelectedNarrative: (content: Narrative | null) => void;
  generatedContent: Narrative[];
  brandLogo: File | null;
  productImage: File | null;
  extraAssets: File | null;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  setIsAiEditMode: (value: boolean) => void;
  setToggleEditNarrative: (value: boolean) => void;
  toggleEditNarrative: boolean;
  refinementLoopSetting: RefinementLoop;
}

const EditNarrative: React.FC<EditNarrativeProps> = ({
  editor,
  projectId,
  selectedNarrative,
  setSelectedNarrative,
  generatedContent,
  brandLogo,
  productImage,
  extraAssets,
  activeTool,
  onChangeActiveTool,
  setIsAiEditMode,
  setToggleEditNarrative,
  toggleEditNarrative,
  refinementLoopSetting,
}) => {
  const { mutate } = useUpdateNarratives(projectId);

  const callRefinementLoop = async (initialImage: string) => {
    const agentData = new FormData();
    agentData.append("projectID", projectId);
    agentData.append("narrative", JSON.stringify(selectedNarrative));
    agentData.append("json_image_string", initialImage);
    agentData.append("config", JSON.stringify(refinementLoopSetting));

    const refined = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_SERVER_FRONTEND}/startAgent/`,
      agentData
    );
    return refined.data;
  };

  const handleImageGeneration = async () => {
    const formData = new FormData();
    formData.append("brand_logo", brandLogo || "");
    formData.append("product_img", productImage || "");
    // formData.append("extra_assets", extraAssets || ""); // Uncomment if extraAssets is used
    formData.append("narrative",JSON.stringify(selectedNarrative) || "");
    formData.append("poster_size",JSON.stringify([900,1200]) || "");

    try {
      onChangeActiveTool("ai");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_FRONTEND}/generate-initial-poster/`,
        formData
      );
      editor?.loadJson(JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    activeTool === "content" &&
    toggleEditNarrative &&
    selectedNarrative && (
      <div className="edit-narrative-container absolute w-full z-50 bg-white p-4 space-y-4">
        <div className="w-full flex justify-between">
          <h2>Edit Narrative</h2>
          <X
            className="size-6"
            onClick={() => {
              setToggleEditNarrative(false);
            }}
          ></X>
        </div>
        <Separator/>
        <ScrollArea className="h-[calc(100vh-150px)]">
          <form className="space-y-4 h-full px-4">

          <h2>Title</h2>
          <div className="form-group">
            <label>Text</label>
            <Input
              type="text"
              value={selectedNarrative.title.text}
              onChange={(e) =>
                setSelectedNarrative({
                  ...selectedNarrative,
                  title: {
                    ...selectedNarrative.title,
                    text: e.target.value,
                  },
                })
              }
              className="text-sm"
            />
          </div>

          <div className="flex space-x-4">
          <div className="form-group flex-1">
            <label>Vertical Alignment</label>
            <Select
            value={selectedNarrative.title.vertical_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                title: {
                  ...selectedNarrative.title,
                  vertical_align: value as "top" | "middle" | "bottom",
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select vertical alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Vertical Alignment</SelectLabel>
                  {alignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="form-group flex-1">
            <label>Horizontal Alignment</label>
            <Select
            value={selectedNarrative.title.horizontal_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                title: {
                  ...selectedNarrative.title,
                  horizontal_align: value as "center" | "left" | "right",
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select horizontal alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Horizontal Alignment</SelectLabel>
                  {horizontalAlignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="form-group flex-1">
            <label>Font</label>
            <Select
            value={selectedNarrative.title.font}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                title: {
                  ...selectedNarrative.title,
                  font: value as Font,
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Font</SelectLabel>
                  {fonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-2" />
        <h2>Tagline</h2>
          <div className="form-group">
            <label>Text</label>
            <Input
              type="text"
              value={selectedNarrative.tagline.text}
              onChange={(e) =>
                setSelectedNarrative({
                  ...selectedNarrative,
                  title: {
                    ...selectedNarrative.tagline,
                    text: e.target.value,
                  },
                })
              }
              className="text-sm"
            />
          </div>

          <div className="flex space-x-4">
          <div className="form-group flex-1">
            <label>Vertical Alignment</label>
            <Select
            value={selectedNarrative.tagline.vertical_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                tagline: {
                  ...selectedNarrative.tagline,
                  vertical_align: value as "top" | "middle" | "bottom",
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select vertical alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Vertical Alignment</SelectLabel>
                  {alignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="form-group flex-1">
            <label>Horizontal Alignment</label>
            <Select
            value={selectedNarrative.tagline.horizontal_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                tagline: {
                  ...selectedNarrative.tagline,
                  horizontal_align: value as "center" | "left" | "right",
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select horizontal alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Horizontal Alignment</SelectLabel>
                  {horizontalAlignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="form-group flex-1">
            <label>Font</label>
            <Select
            value={selectedNarrative.tagline.font}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                tagline: {
                  ...selectedNarrative.tagline,
                  font: value as Font,
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Font</SelectLabel>
                  {fonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        
        <Separator className="my-2" />

        <h2>Image</h2>
          <div className="form-group">
              <label>Description</label>
              <Textarea
                value={selectedNarrative.image.description}
                className="text-sm"
              />
            </div>

          <div className="form-group">
            <label>Background</label>
            <Textarea
              value={selectedNarrative.image.background}
              className="text-sm"
            />
          </div>

          <h2>Product Placement</h2>
          <div className="flex space-x-4">
          <div className="form-group flex-1">
            <label>Vertical Alignment</label>
            <Select
            value={selectedNarrative.image.product.vertical_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                image: {
                  ...selectedNarrative.image,
                  product:{
                    ...selectedNarrative.image.product,
                    vertical_align: value as "top" | "middle" | "bottom"
                  }
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select vertical alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Vertical Alignment</SelectLabel>
                  {alignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="form-group flex-1">
            <label>Horizontal Alignment</label>
            <Select
            value={selectedNarrative.image.product.horizontal_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                image: {
                  ...selectedNarrative.image,
                  product:{
                    ...selectedNarrative.image.product,
                    horizontal_align: value as "center" | "left" | "right",
                  }
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select horizontal alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Horizontal Alignment</SelectLabel>
                  {horizontalAlignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <h2>Logo Placement</h2>
          <div className="flex space-x-4">
          <div className="form-group flex-1">
            <label>Vertical Alignment</label>
            <Select
            value={selectedNarrative.image.logo.vertical_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                image: {
                  ...selectedNarrative.image,
                  logo:{
                    ...selectedNarrative.image.logo,
                    vertical_align: value as "top" | "middle" | "bottom"
                  }
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select vertical alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Vertical Alignment</SelectLabel>
                  {alignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="form-group flex-1">
            <label>Horizontal Alignment</label>
            <Select
            value={selectedNarrative.image.logo.horizontal_align}
            onValueChange={(value) =>
              setSelectedNarrative({
                ...selectedNarrative,
                image: {
                  ...selectedNarrative.image,
                  logo:{
                    ...selectedNarrative.image.logo,
                    horizontal_align: value as "center" | "left" | "right",
                  }
                },
              })
            }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select horizontal alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Horizontal Alignment</SelectLabel>
                  {horizontalAlignments.map((align) => (
                    <SelectItem key={align} value={align}>
                      {align}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
    

            <Button
              type="button"
              onClick={async () => {
                const index = selectedNarrative.index;

                if (index !== -1) {
                  const updatedNarratives = [...generatedContent];
                  updatedNarratives[index] = selectedNarrative;

                  mutate({
                    narrative_0: JSON.stringify(updatedNarratives[0]),
                    narrative_1: JSON.stringify(updatedNarratives[1]),
                    narrative_2: JSON.stringify(updatedNarratives[2]),
                    narrative_3: JSON.stringify(updatedNarratives[3]),
                  });
                  setIsAiEditMode(true);
                  const initialImage = await handleImageGeneration();
                  const refinedImage = await callRefinementLoop(
                    JSON.stringify(initialImage)
                  );
                  setIsAiEditMode(false);
                } else {
                  console.log(
                    "Selected narrative not found in the generated content."
                  );
                }
              }}
              className="w-full mb-2"
            >
              Generate Image
            </Button>
          </form>
        </ScrollArea>
      </div>
    )
  );
};

export default EditNarrative;




























// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { ActiveTool, Narrative, Editor } from "@/features/editor/types";
// import { useUpdateNarratives } from "@/features/narratives/api/use-update-narratives";
// import axios from "axios";
// import { X } from "lucide-react";

// interface EditNarrativeProps {
//   editor: Editor | undefined;
//   projectId: string;
//   selectedNarrative: Narrative | null;
//   setSelectedNarrative: (content: Narrative | null) => void;
//   generatedContent: Narrative[];
//   brandLogo: File | null;
//   productImage: File | null;
//   extraAssets: File | null;
//   activeTool: ActiveTool;
//   onChangeActiveTool: (tool: ActiveTool) => void;
//   setIsAiEditMode: (value: boolean) => void;
//   setToggleEditNarrative: (value: boolean) => void;
//   toggleEditNarrative: boolean;
// }

// const EditNarrative: React.FC<EditNarrativeProps> = ({
//   editor,
//   projectId,
//   selectedNarrative,
//   setSelectedNarrative,
//   generatedContent,
//   brandLogo,
//   productImage,
//   extraAssets,
//   activeTool,
//   onChangeActiveTool,
//   setIsAiEditMode,
//   setToggleEditNarrative,
//   toggleEditNarrative,
// }) => {
//   const { mutate } = useUpdateNarratives(projectId);

//   const callRefinementLoop = async (initialImage: string) => {
//     const agentData = new FormData();
//     agentData.append("projectID", projectId);
//     agentData.append("narrative", JSON.stringify(selectedNarrative));
//     agentData.append("json_image_string", initialImage);

//     const refined = await axios.post(
//       `${process.env.NEXT_PUBLIC_BACKEND_SERVER_FRONTEND}/startAgent/`,
//       agentData
//     );
//     return refined.data;
//   };

//   const handleImageGeneration = async () => {
//     // console.log(selectedNarrative.productName)
//     const formData = new FormData();
//     formData.append("brand_logo", brandLogo || "");
//     formData.append("product_img", productImage || "");
//     // formData.append("extra_assets", extraAssets || "");
//     formData.append("description", selectedNarrative?.description ?? "");
//     formData.append("background", selectedNarrative?.background ?? "");
//     formData.append("title", selectedNarrative?.title ?? "");
//     formData.append("tagline", selectedNarrative?.tagline ?? "");
//     formData.append("productName", selectedNarrative?.productName ?? "");

//     try {
//       onChangeActiveTool("ai");
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_SERVER_FRONTEND}/generate-initial-poster/`,
//         formData
//       );
//       // console.log(response.data);
//       editor?.loadJson(JSON.stringify(response.data));
//       return response.data;
//     } catch (error) {
//       console.error("Error generating image:", error);
//     }
//   };

//   return (
//     activeTool === "content" &&
//     toggleEditNarrative &&
//     selectedNarrative && (
//       <div className="edit-narrative-container absolute w-full z-50 bg-white p-4 space-y-4">
//         <div className="w-full flex justify-between">
//           <h2>Edit Narrative</h2>
//           <X
//             className="size-6"
//             onClick={() => {
//               setToggleEditNarrative(false);
//             }}
//           ></X>
//         </div>
//         <ScrollArea className="h-[calc(100vh-150px)]">
//           <form className="space-y-4 h-full p-4">
//             <div className="form-group">
//               <label>Title</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.title}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     title: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Tagline</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.tagline}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     tagline: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

            // <div className="form-group">
            //   <label>Description</label>
            //   <Textarea
            //     value={selectedNarrative.description}
            //     onChange={(e) =>
            //       setSelectedNarrative({
            //         ...selectedNarrative,
            //         description: e.target.value,
            //       })
            //     }
            //     className="text-sm"
            //   />
            // </div>

//             <div className="form-group">
//               <label>Color Palette</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.color_palette}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     color_palette: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Layout</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.layout}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     layout: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Main Image</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.main_image}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     main_image: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Background</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.background}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     background: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Title Treatment Font</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.title_treatment.font}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     title_treatment: {
//                       ...selectedNarrative.title_treatment,
//                       font: e.target.value,
//                     },
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Title Treatment Style</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.title_treatment.style}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     title_treatment: {
//                       ...selectedNarrative.title_treatment,
//                       style: e.target.value,
//                     },
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Title Treatment Placement</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.title_treatment.placement}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     title_treatment: {
//                       ...selectedNarrative.title_treatment,
//                       placement: e.target.value,
//                     },
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Tagline Treatment Font</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.tagline_treatment.font}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     tagline_treatment: {
//                       ...selectedNarrative.tagline_treatment,
//                       font: e.target.value,
//                     },
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Tagline Treatment Style</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.tagline_treatment.style}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     tagline_treatment: {
//                       ...selectedNarrative.tagline_treatment,
//                       style: e.target.value,
//                     },
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Tagline Treatment Placement</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.tagline_treatment.placement}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     tagline_treatment: {
//                       ...selectedNarrative.tagline_treatment,
//                       placement: e.target.value,
//                     },
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Additional Elements</label>
//               <Textarea
//                 value={selectedNarrative.additional_elements}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     additional_elements: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Mood</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.mood}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     mood: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Brand Logo Usage</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.brand_logo_image}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     brand_logo_image: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Product Image Usage</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.product_image_image}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     product_image_image: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>

//             <div className="form-group">
//               <label>Extra Assets Usage</label>
//               <Input
//                 type="text"
//                 value={selectedNarrative.extra_assets_images}
//                 onChange={(e) =>
//                   setSelectedNarrative({
//                     ...selectedNarrative,
//                     extra_assets_images: e.target.value,
//                   })
//                 }
//                 className="text-sm"
//               />
//             </div>
//             <Button
//               type="button"
//               onClick={async () => {
//                 const index = selectedNarrative["index"];

//                 if (index !== -1) {
//                   const updatedNarratives = generatedContent;
//                   generatedContent[index] = selectedNarrative;

//                   mutate({
//                     narrative_0: JSON.stringify(updatedNarratives[0]),
//                     narrative_1: JSON.stringify(updatedNarratives[1]),
//                     narrative_2: JSON.stringify(updatedNarratives[2]),
//                     narrative_3: JSON.stringify(updatedNarratives[3]),
//                   });
//                   setIsAiEditMode(true);
//                   const initialImage = await handleImageGeneration();
//                   const refinedImage = await callRefinementLoop(
//                     JSON.stringify(initialImage)
//                   );
//                   setIsAiEditMode(false);
//                 } else {
//                   console.log(
//                     "Selected narrative not found in the generated content."
//                   );
//                 }
//               }}
//               className="w-full mb-2"
//             >
//               Generate Image
//             </Button>
//           </form>
//         </ScrollArea>
//       </div>
//     )
//   );
// };

// export default EditNarrative;
